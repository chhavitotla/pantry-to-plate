import json
import re
from typing import Any, Dict, List, Tuple

from app.agent.llm import invoke_json_prompt
from app.agent.prompts import (
    MEAL_PLAN_FOLLOW_UP_HUMAN_PROMPT,
    MEAL_PLAN_FOLLOW_UP_SYSTEM_PROMPT,
)
from app.agent.utils import (
    build_day_plan_entry,
    build_recipe_lookups,
    normalize_text,
    pantry_overlap_count,
    recipe_goal_score,
    sort_days,
)


def _canonical_day_keys(days: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    canonical: Dict[str, Dict[str, Any]] = {}
    for i in range(1, 6):
        day_key = f"day_{i}"
        raw = days.get(day_key, {})
        if not isinstance(raw, dict):
            raw = {}
        canonical[day_key] = {
            "recipe": str(raw.get("recipe", "")),
            "recipe_id": str(raw.get("recipe_id", "")),
            "steps": [str(step).strip() for step in raw.get("steps", []) if str(step).strip()],
        }
    return canonical


def _resolve_candidate_recipe(
    payload: Dict[str, Any],
    candidates_by_id: Dict[str, Dict[str, Any]],
    candidates_by_name: Dict[str, Dict[str, Any]],
) -> Dict[str, Any] | None:
    recipe_id = str(payload.get("recipe_id", "")).strip()
    recipe_name = normalize_text(str(payload.get("recipe", "")))

    if recipe_id and recipe_id in candidates_by_id:
        return candidates_by_id[recipe_id]
    if recipe_name and recipe_name in candidates_by_name:
        return candidates_by_name[recipe_name]
    return None


def _extract_day_number(question: str) -> int | None:
    patterns = [
        r"\bday[\s_-]*(\d)\b",
        r"\b(\d)(?:st|nd|rd|th)\s+day\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, question.lower())
        if match:
            day_number = int(match.group(1))
            if 1 <= day_number <= 5:
                return day_number
    return None


def _deterministic_swap(
    days: Dict[str, Dict[str, Any]],
    question: str,
    candidates: List[Dict[str, Any]],
    goal: str,
    pantry_items: List[str],
) -> Tuple[Dict[str, Dict[str, Any]], str, bool]:
    day_number = _extract_day_number(question)
    if day_number is None:
        return days, "", False

    if not re.search(r"\b(swap|replace|change|switch|alternate)\b", question.lower()):
        return days, "", False

    day_key = f"day_{day_number}"
    current_day = days.get(day_key, {})
    current_recipe_id = str(current_day.get("recipe_id", ""))
    used_ids = {
        str(day.get("recipe_id", ""))
        for day in days.values()
        if str(day.get("recipe_id", ""))
    }

    best_candidate: Dict[str, Any] | None = None
    best_score = float("-inf")
    for candidate in candidates:
        candidate_id = str(candidate.get("recipe_id", ""))
        if not candidate_id or candidate_id == current_recipe_id:
            continue
        score = recipe_goal_score(candidate, goal)
        score += pantry_overlap_count(candidate, pantry_items) * 2.0
        if candidate_id in used_ids:
            score -= 8.0
        if score > best_score:
            best_score = score
            best_candidate = candidate

    if best_candidate is None:
        return days, "", False

    updated_days = dict(days)
    updated_days[day_key] = build_day_plan_entry(best_candidate)
    answer = f"Swapped Day {day_number} to {best_candidate.get('recipe_name', 'a new recipe')}."
    return updated_days, answer, True


def run_meal_plan_follow_up(
    *,
    question: str,
    current_days: Dict[str, Any],
    candidate_recipes: List[Dict[str, Any]],
    pantry_items: List[str],
    goal: str,
    meal_type: str,
    dietary_type: str,
    allergies: List[str],
) -> Dict[str, Any]:
    days = _canonical_day_keys(current_days)
    candidates_by_id, candidates_by_name = build_recipe_lookups(candidate_recipes)

    candidate_payload = [
        {
            "recipe_id": str(recipe.get("recipe_id", "")),
            "recipe_name": str(recipe.get("recipe_name", "")),
            "steps": recipe.get("steps", []),
            "ingredients": recipe.get("ingredients", []),
            "nutrition_profile": recipe.get("nutrition_profile", []),
            "macros_per_serving": recipe.get("macros_per_serving", {}),
            "pantry_match": recipe.get("pantry_match", 0.0),
        }
        for recipe in candidate_recipes[:12]
    ]

    updated_days = dict(days)
    answer = ""
    changed_keys: List[str] = []

    llm_failed = False
    try:
        llm_result = invoke_json_prompt(
            system_prompt=MEAL_PLAN_FOLLOW_UP_SYSTEM_PROMPT,
            human_prompt=MEAL_PLAN_FOLLOW_UP_HUMAN_PROMPT,
            payload={
                "question": question,
                "current_plan": json.dumps(days, ensure_ascii=False),
                "candidate_recipes": json.dumps(candidate_payload, ensure_ascii=False, default=str),
                "pantry_items": json.dumps(pantry_items, ensure_ascii=False),
                "goal": goal,
                "meal_type": meal_type,
                "dietary_type": dietary_type,
                "allergies": json.dumps(allergies, ensure_ascii=False),
            },
            temperature=0.2,
        )

        answer = str(llm_result.get("answer", "")).strip()
        updates = llm_result.get("updates", {})
        if isinstance(updates, dict):
            for day_key, payload in updates.items():
                if day_key not in updated_days or not isinstance(payload, dict):
                    continue
                resolved = _resolve_candidate_recipe(payload, candidates_by_id, candidates_by_name)
                if not resolved:
                    continue
                entry = build_day_plan_entry(resolved)
                steps = [
                    str(step).strip()
                    for step in payload.get("steps", [])
                    if str(step).strip()
                ]
                if steps:
                    entry["steps"] = steps[:4]
                updated_days[day_key] = entry
                changed_keys.append(day_key)
    except Exception:
        llm_failed = True

    if not changed_keys:
        updated_days, fallback_answer, applied = _deterministic_swap(
            days=updated_days,
            question=question,
            candidates=candidate_recipes,
            goal=goal,
            pantry_items=pantry_items,
        )
        if applied:
            changed_keys = [
                day_key
                for day_key in updated_days
                if updated_days[day_key] != days.get(day_key)
            ]
            if not answer:
                answer = fallback_answer

    if not answer:
        answer = (
            "Updated your plan where possible. Ask something like 'swap day 3' for a direct replacement."
            if changed_keys
            else "I reviewed your plan. Tell me which day to swap and I can replace it instantly."
        )

    trace: List[str] = []
    if changed_keys:
        changed = ", ".join(sorted(changed_keys, key=lambda key: int(key.split("_")[1])))
        trace.append(
            "Meal Plan Follow-up Agent: applied user-requested updates to "
            f"{changed}" + (" (fallback mode)." if llm_failed else ".")
        )
    else:
        trace.append(
            "Meal Plan Follow-up Agent: no structural day changes were needed for this question."
        )

    return {
        "answer": answer,
        "days": sort_days(updated_days),
        "trace": trace,
    }

