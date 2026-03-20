import json
from typing import Any, Dict, List

from app.agent.llm import invoke_json_prompt
from app.agent.prompts import MEAL_PLANNING_HUMAN_PROMPT, MEAL_PLANNING_SYSTEM_PROMPT
from app.agent.state import MealPlanState
from app.agent.utils import (
    build_day_plan_entry,
    build_recipe_lookups,
    normalize_text,
    recipe_goal_score,
)
from app.ai.retriever import retrieve_similar_recipe_ids


def _semantic_query(state: MealPlanState) -> str:
    pantry = ", ".join(state.get("pantry_items", []))
    allergies = ", ".join(state.get("allergies", []))
    return (
        f"meal type: {state.get('meal_type', '')} | "
        f"goal: {state.get('goal', '')} | "
        f"dietary type: {state.get('dietary_type', '')} | "
        f"pantry: {pantry} | "
        f"avoid: {allergies}"
    )


def _rank_candidates(filtered: List[Dict[str, Any]], state: MealPlanState) -> List[Dict[str, Any]]:
    by_id = {str(recipe.get("recipe_id", "")): recipe for recipe in filtered}
    candidate_ids = [recipe_id for recipe_id in by_id if recipe_id]
    rag_ids = retrieve_similar_recipe_ids(
        query=_semantic_query(state),
        candidate_recipe_ids=candidate_ids,
        k=min(12, max(5, len(candidate_ids))),
        use_agent_key=True,
    )

    ranked: List[Dict[str, Any]] = []
    seen: set[str] = set()
    for recipe_id in rag_ids:
        recipe = by_id.get(recipe_id)
        if recipe is None or recipe_id in seen:
            continue
        seen.add(recipe_id)
        ranked.append(recipe)

    fallback = [recipe for recipe in filtered if str(recipe.get("recipe_id", "")) not in seen]
    fallback.sort(
        key=lambda recipe: recipe_goal_score(recipe, state.get("goal", "balanced")),
        reverse=True,
    )
    ranked.extend(fallback)
    return ranked


def _deterministic_plan(candidates: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    days: Dict[str, Dict[str, Any]] = {}
    for day_index in range(1, 6):
        recipe = candidates[(day_index - 1) % len(candidates)]
        days[f"day_{day_index}"] = build_day_plan_entry(recipe)
    return days


def _sanitize_generated_plan(
    generated: Any,
    candidates: List[Dict[str, Any]],
) -> Dict[str, Dict[str, Any]]:
    recipes_by_id, recipes_by_name = build_recipe_lookups(candidates)
    fallback_plan = _deterministic_plan(candidates)

    if not isinstance(generated, dict):
        return fallback_plan

    normalized_days: Dict[str, Dict[str, Any]] = {}
    for day_index in range(1, 6):
        day_key = f"day_{day_index}"
        raw_day = generated.get(day_key, {})
        resolved_recipe: Dict[str, Any] | None = None

        if isinstance(raw_day, dict):
            recipe_id = str(raw_day.get("recipe_id", "")).strip()
            recipe_name = normalize_text(str(raw_day.get("recipe", "")))

            if recipe_id and recipe_id in recipes_by_id:
                resolved_recipe = recipes_by_id[recipe_id]
            elif recipe_name and recipe_name in recipes_by_name:
                resolved_recipe = recipes_by_name[recipe_name]

            if resolved_recipe:
                steps = [
                    str(step).strip()
                    for step in raw_day.get("steps", [])
                    if str(step).strip()
                ]
                entry = build_day_plan_entry(resolved_recipe)
                if steps:
                    entry["steps"] = steps[:4]
                normalized_days[day_key] = entry
                continue

        normalized_days[day_key] = fallback_plan[day_key]

    return normalized_days


def run_meal_planning_node(state: MealPlanState) -> MealPlanState:
    filtered = state.get("filtered_recipes", [])
    if not filtered:
        return {
            **state,
            "rag_recipes": [],
            "selected_recipes": [],
            "daily_plan": {},
            "error": "No recipes available for meal planning.",
        }

    ranked_candidates = _rank_candidates(filtered, state)
    rag_recipes = ranked_candidates[:10]
    if not rag_recipes:
        return {
            **state,
            "rag_recipes": [],
            "selected_recipes": [],
            "daily_plan": {},
            "error": "RAG retrieval returned no candidate recipes.",
        }

    candidate_payload = [
        {
            "recipe_id": str(recipe.get("recipe_id", "")),
            "recipe_name": str(recipe.get("recipe_name", "")),
            "ingredients": recipe.get("ingredients", []),
            "steps": recipe.get("steps", []),
            "nutrition_profile": recipe.get("nutrition_profile", []),
            "macros_per_serving": recipe.get("macros_per_serving", {}),
            "pantry_match": recipe.get("pantry_match", 0.0),
        }
        for recipe in rag_recipes[:8]
    ]

    plan: Dict[str, Dict[str, Any]]
    llm_failed = False
    try:
        generated = invoke_json_prompt(
            system_prompt=MEAL_PLANNING_SYSTEM_PROMPT,
            human_prompt=MEAL_PLANNING_HUMAN_PROMPT,
            payload={
                "pantry_items": json.dumps(state.get("pantry_items", []), ensure_ascii=False),
                "meal_type": state.get("meal_type", ""),
                "goal": state.get("goal", ""),
                "dietary_type": state.get("dietary_type", ""),
                "allergies": json.dumps(state.get("allergies", []), ensure_ascii=False),
                "candidate_recipes": json.dumps(candidate_payload, ensure_ascii=False, default=str),
            },
            temperature=0.25,
        )
        plan = _sanitize_generated_plan(generated, rag_recipes)
    except Exception:
        llm_failed = True
        plan = _deterministic_plan(rag_recipes)

    selected_ids: List[str] = []
    selected_recipes: List[Dict[str, Any]] = []
    rag_by_id = {str(recipe.get("recipe_id", "")): recipe for recipe in rag_recipes}
    for day_key in [f"day_{i}" for i in range(1, 6)]:
        recipe_id = str(plan.get(day_key, {}).get("recipe_id", ""))
        if recipe_id and recipe_id not in selected_ids and recipe_id in rag_by_id:
            selected_ids.append(recipe_id)
            selected_recipes.append(rag_by_id[recipe_id])

    trace = list(state.get("trace", []))
    recipe_names = [plan[f"day_{i}"]["recipe"] for i in range(1, 6)]
    trace.append(
        "Meal Planning Agent: built initial 5-day RAG draft"
        + (" (fallback mode)." if llm_failed else ".")
        + f" Days: {', '.join(recipe_names)}."
    )

    return {
        **state,
        "rag_recipes": rag_recipes,
        "selected_recipes": selected_recipes,
        "daily_plan": plan,
        "iteration": state.get("iteration", 0),
        "error": None,
        "trace": trace,
    }

