from collections import Counter
from typing import Any, Dict, List

from app.agent.state import MealPlanState
from app.agent.utils import (
    build_day_plan_entry,
    build_recipe_lookups,
    find_recipe_for_day,
    normalize_text,
    pantry_overlap_count,
    recipe_goal_score,
    sort_days,
)


def _recipe_ingredient_terms(recipe: Dict[str, Any]) -> set[str]:
    terms: set[str] = set()
    for ingredient in recipe.get("ingredients", []):
        normalized = normalize_text(str(ingredient.get("item", "")))
        for term in normalized.split():
            if term:
                terms.add(term)
    return terms


def _compute_pantry_usage(
    plan: Dict[str, Dict[str, Any]],
    pantry_items: List[str],
    recipes_by_id: Dict[str, Dict[str, Any]],
    recipes_by_name: Dict[str, Dict[str, Any]],
) -> Dict[str, int]:
    pantry_terms: set[str] = set()
    for item in pantry_items:
        pantry_terms.update(normalize_text(item).split())

    usage: Counter[str] = Counter()
    for day in plan.values():
        recipe = find_recipe_for_day(day, recipes_by_id, recipes_by_name)
        if not recipe:
            continue
        for term in _recipe_ingredient_terms(recipe):
            if term in pantry_terms:
                usage[term] += 1
    return dict(usage)


def _best_replacement(
    current_recipe_id: str,
    current_plan_recipe_ids: set[str],
    candidates: List[Dict[str, Any]],
    goal: str,
    avoid_term: str | None = None,
) -> Dict[str, Any] | None:
    best: Dict[str, Any] | None = None
    best_score = float("-inf")

    for recipe in candidates:
        recipe_id = str(recipe.get("recipe_id", ""))
        if not recipe_id or recipe_id == current_recipe_id:
            continue
        if recipe_id in current_plan_recipe_ids and len(current_plan_recipe_ids) < 5:
            continue
        if avoid_term and avoid_term in _recipe_ingredient_terms(recipe):
            continue

        score = recipe_goal_score(recipe, goal) + (float(recipe.get("pantry_match", 0.0)) * 10.0)
        if score > best_score:
            best_score = score
            best = recipe

    return best


def run_pantry_management_node(state: MealPlanState) -> MealPlanState:
    daily_plan = sort_days(state.get("daily_plan", {}))
    if not daily_plan:
        return {
            **state,
            "pantry_usage": {},
            "error": "Pantry Management Agent: daily plan is empty.",
        }

    candidate_pool = state.get("rag_recipes") or state.get("filtered_recipes", [])
    recipes_by_id, recipes_by_name = build_recipe_lookups(candidate_pool)
    if not recipes_by_id and not recipes_by_name:
        return {
            **state,
            "pantry_usage": {},
            "error": "Pantry Management Agent: no recipe pool available.",
        }

    changed_days: List[str] = []

    # Pass 1: reduce direct recipe repetition when alternatives exist.
    recipe_counts: Counter[str] = Counter()
    for day in daily_plan.values():
        recipe_counts[str(day.get("recipe_id", ""))] += 1

    for day_key, day_data in daily_plan.items():
        recipe_id = str(day_data.get("recipe_id", ""))
        if recipe_counts.get(recipe_id, 0) <= 1:
            continue

        current_ids = {str(day.get("recipe_id", "")) for day in daily_plan.values() if day.get("recipe_id")}
        replacement = _best_replacement(
            current_recipe_id=recipe_id,
            current_plan_recipe_ids=current_ids,
            candidates=candidate_pool,
            goal=state.get("goal", "balanced"),
        )
        if replacement is None:
            continue

        daily_plan[day_key] = build_day_plan_entry(replacement)
        recipe_counts[recipe_id] -= 1
        recipe_counts[str(replacement.get("recipe_id", ""))] += 1
        changed_days.append(day_key)

    # Pass 2: avoid overusing one pantry ingredient across too many days.
    usage = _compute_pantry_usage(
        plan=daily_plan,
        pantry_items=state.get("pantry_items", []),
        recipes_by_id=recipes_by_id,
        recipes_by_name=recipes_by_name,
    )
    overused_terms = [term for term, count in usage.items() if count >= 4]

    for overused in overused_terms:
        for day_key, day_data in daily_plan.items():
            recipe = find_recipe_for_day(day_data, recipes_by_id, recipes_by_name)
            if not recipe:
                continue
            if overused not in _recipe_ingredient_terms(recipe):
                continue

            current_ids = {str(day.get("recipe_id", "")) for day in daily_plan.values() if day.get("recipe_id")}
            replacement = _best_replacement(
                current_recipe_id=str(day_data.get("recipe_id", "")),
                current_plan_recipe_ids=current_ids,
                candidates=candidate_pool,
                goal=state.get("goal", "balanced"),
                avoid_term=overused,
            )
            if replacement is None:
                continue

            daily_plan[day_key] = build_day_plan_entry(replacement)
            changed_days.append(day_key)
            break

    usage = _compute_pantry_usage(
        plan=daily_plan,
        pantry_items=state.get("pantry_items", []),
        recipes_by_id=recipes_by_id,
        recipes_by_name=recipes_by_name,
    )

    trace = list(state.get("trace", []))
    if changed_days:
        changed_labels = ", ".join(sorted(set(changed_days), key=lambda day: int(day.split("_")[1])))
        trace.append(
            f"Pantry Management Agent: rebalanced pantry usage and adjusted {changed_labels}."
        )
    else:
        trace.append("Pantry Management Agent: pantry distribution looked realistic, no swaps needed.")

    return {
        **state,
        "daily_plan": daily_plan,
        "pantry_usage": usage,
        "error": None,
        "trace": trace,
    }

