from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from app.agent.follow_up import run_meal_plan_follow_up
from app.models.request import MealPlanRequest
from app.models.response import (
    DayPlanResponse,
    MealPlanFollowUpResponse,
    MealPlanResponse,
)
from app.db.queries import find_filtered_recipes
from app.agent.graph import run_meal_plan_agent
from app.core.config import settings
from app.models.request import MealPlanFollowUpRequest


router = APIRouter()


# dietary expansion logic
_DIETARY_EXPANSION: Dict[str, List[str]] = {
    "vegan":           ["vegan"],
    "vegetarian":      ["vegetarian", "vegan"],
    "non-vegetarian":  ["vegetarian", "vegan", "non-vegetarian"],
}


def _normalize_list(items: List[str]) -> List[str]:
    normalized = []
    for i in items:
        s = i.strip().lower()
        for ch in ".,-/()":
            s = s.replace(ch, "")
        normalized.append(s)
    return normalized


def _fetch_expanded_recipes(
    pantry_items: List[str],
    meal_type: str,
    allergies: List[str],
    dietary_type: str,
) -> List[Dict[str, Any]]:
    """
    Calls existing find_filtered_recipes once per dietary type in the
    expansion list, merges results, deduplicates by recipe_id.
    max_time_minutes=9999 effectively removes the time constraint
    without touching a single line of queries.py.
    """
    dietary_types = _DIETARY_EXPANSION.get(dietary_type, [dietary_type])

    seen_ids:      set[str]          = set()
    merged:        List[Dict[str, Any]] = []

    for dtype in dietary_types:
        results = find_filtered_recipes(
            pantry_items=pantry_items,
            dietary_type=dtype,
            meal_type=meal_type,
            max_time_minutes=9999,
            allergies=allergies,
        )
        for recipe in results:
            rid = str(recipe.get("recipe_id", ""))
            if rid and rid not in seen_ids:
                seen_ids.add(rid)
                merged.append(recipe)

    return merged


def _build_initial_state(
    body: MealPlanRequest,
    filtered_recipes: List[Dict[str, Any]],
) -> Dict[str, Any]:
    return {
        "pantry_items": body.pantry_items,
        "meal_type": body.meal_type,
        "goal": body.goal,
        "allergies": body.allergies,
        "dietary_type": body.dietary_type,
        "filtered_recipes": filtered_recipes,
        "rag_recipes": [],
        "selected_recipes": [],
        "day_0_prep": [],
        "daily_plan": {},
        "pantry_usage": {},
        "nutrition_evaluation": {},
        "iteration": 0,
        "max_iterations": settings.agent_max_iterations,
        "target_score": settings.agent_target_score,
        "is_satisfactory": False,
        "trace": [],
        "final_output": None,
        "error": None,
    }


def _serialize_response(final_state: Dict[str, Any]) -> MealPlanResponse:
    output = final_state.get("final_output") or {}

    raw_days = output.get("days", {})
    serialized_days: Dict[str, DayPlanResponse] = {}

    for day_key, day_data in raw_days.items():
        if isinstance(day_data, dict):
            serialized_days[day_key] = DayPlanResponse(
                recipe=str(day_data.get("recipe", "")),
                steps=list(day_data.get("steps", [])),
                recipe_id=str(day_data.get("recipe_id", "")) or None,
            )

    return MealPlanResponse(
        day_0_prep=list(output.get("day_0_prep", [])),
        days=serialized_days,
        notes=list(output.get("notes", [])),
        trace=list(output.get("trace", [])),
        nutrition_scores=dict(output.get("nutrition_scores", {})),
        status="OK",
    )


@router.post("/meal-plan", response_model=MealPlanResponse)
def meal_plan(body: MealPlanRequest):

    pantry_norm   = _normalize_list(body.pantry_items)
    allergies_norm = _normalize_list(body.allergies)

    # step 1: mongo hard filter 
    filtered_recipes = _fetch_expanded_recipes(
        pantry_items=pantry_norm,
        meal_type=body.meal_type,
        allergies=allergies_norm,
        dietary_type=body.dietary_type,
    )

    if not filtered_recipes:
        raise HTTPException(
            status_code=404,
            detail="No recipes found matching your pantry and preferences.",
        )

    # step 2: build initial state and run agent 
    initial_state = _build_initial_state(body, filtered_recipes)
    final_state   = run_meal_plan_agent(initial_state)

    # step 3: surface agent-level errors cleanly 
    error = final_state.get("error")
    if error:
        raise HTTPException(status_code=422, detail=error)

    return _serialize_response(final_state)


@router.post("/meal-plan-chat", response_model=MealPlanFollowUpResponse)
def meal_plan_chat(body: MealPlanFollowUpRequest):
    pantry_norm = _normalize_list(body.pantry_items)
    allergies_norm = _normalize_list(body.allergies)

    filtered_recipes = _fetch_expanded_recipes(
        pantry_items=pantry_norm,
        meal_type=body.meal_type,
        allergies=allergies_norm,
        dietary_type=body.dietary_type,
    )
    if not filtered_recipes:
        raise HTTPException(
            status_code=404,
            detail="No recipes found matching your pantry and preferences.",
        )

    follow_up = run_meal_plan_follow_up(
        question=body.question,
        current_days={day_key: day.model_dump() for day_key, day in body.days.items()},
        candidate_recipes=filtered_recipes,
        pantry_items=pantry_norm,
        goal=body.goal,
        meal_type=body.meal_type,
        dietary_type=body.dietary_type,
        allergies=allergies_norm,
    )

    updated_days = {
        day_key: DayPlanResponse(
            recipe=str(day_data.get("recipe", "")),
            steps=[str(step) for step in day_data.get("steps", [])],
            recipe_id=str(day_data.get("recipe_id", "")) or None,
        )
        for day_key, day_data in follow_up.get("days", {}).items()
        if isinstance(day_data, dict)
    }

    return MealPlanFollowUpResponse(
        answer=str(follow_up.get("answer", "")),
        days=updated_days,
        trace=list(follow_up.get("trace", [])),
        status="OK",
    )
