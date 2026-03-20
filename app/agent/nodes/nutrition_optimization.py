from typing import Any, Dict, List, Tuple

from app.agent.state import MealPlanState
from app.agent.utils import (
    build_day_plan_entry,
    build_recipe_lookups,
    find_recipe_for_day,
    goal_tag_hit,
    recipe_goal_score,
    sort_days,
)


def _day_score_snapshot(day_metrics: Dict[str, float], goal: str) -> float:
    protein = float(day_metrics.get("protein", 0.0))
    fibre = float(day_metrics.get("fibre", 0.0))
    goal_hit = float(day_metrics.get("goal_hit", 0.0))

    if goal == "high_protein":
        return (protein * 2.2) + (fibre * 0.8) + (goal_hit * 12.0)
    if goal == "high_fiber":
        return (protein * 1.0) + (fibre * 2.0) + (goal_hit * 12.0)
    return (protein * 1.4) + (fibre * 1.4) + (goal_hit * 12.0)


def _candidate_day_score(recipe: Dict[str, Any], goal: str) -> float:
    macros = recipe.get("macros_per_serving", {}) or {}
    protein = float(macros.get("protein_g") or 0.0)
    fibre = float(macros.get("fibre_g") or 0.0)
    hit = 1.0 if goal_tag_hit(recipe, goal) else 0.0
    return _day_score_snapshot(
        {"protein": protein, "fibre": fibre, "goal_hit": hit},
        goal,
    )


def _rank_low_days(per_day_scores: Dict[str, Dict[str, float]], goal: str) -> List[Tuple[str, float]]:
    ranked = []
    for day_key, metrics in per_day_scores.items():
        ranked.append((day_key, _day_score_snapshot(metrics, goal)))
    ranked.sort(key=lambda item: item[1])
    return ranked


def run_nutrition_optimization_node(state: MealPlanState) -> MealPlanState:
    current_iteration = int(state.get("iteration", 0))
    plan = sort_days(state.get("daily_plan", {}))
    nutrition_eval = state.get("nutrition_evaluation", {})
    if not plan:
        return {
            **state,
            "iteration": current_iteration + 1,
            "error": "Nutrition Optimization Agent: daily plan is empty.",
        }

    per_day_scores = nutrition_eval.get("per_day_scores", {})
    if not isinstance(per_day_scores, dict) or not per_day_scores:
        return {
            **state,
            "iteration": current_iteration + 1,
            "error": "Nutrition Optimization Agent: per-day score map missing.",
        }

    candidates = state.get("rag_recipes") or state.get("filtered_recipes", [])
    recipes_by_id, recipes_by_name = build_recipe_lookups(candidates)
    goal = state.get("goal", "balanced")

    changed: List[str] = []
    ranked_days = _rank_low_days(per_day_scores, goal)
    max_swaps = 2
    swaps = 0

    for day_key, old_score in ranked_days:
        if swaps >= max_swaps:
            break

        day_data = plan.get(day_key, {})
        current_recipe = find_recipe_for_day(day_data, recipes_by_id, recipes_by_name)
        if current_recipe is None:
            continue

        current_recipe_id = str(current_recipe.get("recipe_id", ""))
        used_ids = {
            str(entry.get("recipe_id", ""))
            for entry in plan.values()
            if str(entry.get("recipe_id", ""))
        }

        best_candidate: Dict[str, Any] | None = None
        best_score = old_score

        for candidate in candidates:
            candidate_id = str(candidate.get("recipe_id", ""))
            if not candidate_id or candidate_id == current_recipe_id:
                continue
            if candidate_id in used_ids and len(used_ids) < 5:
                continue

            candidate_score = _candidate_day_score(candidate, goal)
            candidate_score += (float(candidate.get("pantry_match", 0.0)) * 2.5)
            candidate_score += (recipe_goal_score(candidate, goal) / 25.0)

            if candidate_score > best_score + 1.5:
                best_score = candidate_score
                best_candidate = candidate

        if best_candidate is None:
            continue

        plan[day_key] = build_day_plan_entry(best_candidate)
        swaps += 1
        changed.append(day_key)

    trace = list(state.get("trace", []))
    if changed:
        changed_text = ", ".join(sorted(changed, key=lambda day: int(day.split("_")[1])))
        trace.append(
            f"Nutrition Optimization Agent: improved lower-scoring days via swaps ({changed_text})."
        )
    else:
        trace.append(
            "Nutrition Optimization Agent: no strong swap found without breaking pantry constraints."
        )

    return {
        **state,
        "daily_plan": plan,
        "iteration": current_iteration + 1,
        "error": None,
        "trace": trace,
    }

