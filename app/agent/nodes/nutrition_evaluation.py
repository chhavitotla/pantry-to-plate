from collections import Counter
from typing import Any, Dict, List

from app.agent.state import MealPlanState
from app.agent.utils import build_recipe_lookups, find_recipe_for_day, goal_tag_hit, sort_days


def _goal_targets(goal: str) -> tuple[float, float]:
    if goal == "high_protein":
        return 24.0, 5.5
    if goal == "high_fiber":
        return 16.0, 8.0
    return 20.0, 6.0


def run_nutrition_evaluation_node(state: MealPlanState) -> MealPlanState:
    plan = sort_days(state.get("daily_plan", {}))
    if not plan:
        return {
            **state,
            "nutrition_evaluation": {},
            "is_satisfactory": False,
            "error": "Nutrition Evaluation Agent: daily plan is empty.",
        }

    pool = state.get("rag_recipes") or state.get("filtered_recipes", [])
    recipes_by_id, recipes_by_name = build_recipe_lookups(pool)

    protein_target, fibre_target = _goal_targets(state.get("goal", "balanced"))
    protein_total = 0.0
    fibre_total = 0.0
    goal_hits = 0
    available_days = 0
    used_recipe_ids: List[str] = []

    per_day_scores: Dict[str, Dict[str, float]] = {}
    for day_key, day_data in plan.items():
        recipe = find_recipe_for_day(day_data, recipes_by_id, recipes_by_name)
        if not recipe:
            continue

        macros = recipe.get("macros_per_serving", {}) or {}
        protein = float(macros.get("protein_g") or 0.0)
        fibre = float(macros.get("fibre_g") or 0.0)
        protein_total += protein
        fibre_total += fibre
        available_days += 1

        if goal_tag_hit(recipe, state.get("goal", "balanced")):
            goal_hits += 1

        recipe_id = str(recipe.get("recipe_id", ""))
        if recipe_id:
            used_recipe_ids.append(recipe_id)

        per_day_scores[day_key] = {
            "protein": protein,
            "fibre": fibre,
            "goal_hit": 1.0 if goal_tag_hit(recipe, state.get("goal", "balanced")) else 0.0,
        }

    if available_days == 0:
        return {
            **state,
            "nutrition_evaluation": {},
            "is_satisfactory": False,
            "error": "Nutrition Evaluation Agent: could not map plan days to recipes.",
        }

    avg_protein = protein_total / available_days
    avg_fibre = fibre_total / available_days
    protein_score = min(100.0, (avg_protein / protein_target) * 100.0)
    fibre_score = min(100.0, (avg_fibre / fibre_target) * 100.0)
    alignment_score = (goal_hits / available_days) * 100.0
    unique_recipe_ratio = len(set(used_recipe_ids)) / max(1, available_days)
    variety_score = unique_recipe_ratio * 100.0

    goal = state.get("goal", "balanced")
    if goal == "high_protein":
        overall = (
            (0.45 * protein_score)
            + (0.2 * fibre_score)
            + (0.25 * alignment_score)
            + (0.1 * variety_score)
        )
    elif goal == "high_fiber":
        overall = (
            (0.2 * protein_score)
            + (0.45 * fibre_score)
            + (0.25 * alignment_score)
            + (0.1 * variety_score)
        )
    else:
        overall = (
            (0.3 * protein_score)
            + (0.3 * fibre_score)
            + (0.3 * alignment_score)
            + (0.1 * variety_score)
        )

    weaknesses: List[str] = []
    if protein_score < 70:
        weaknesses.append("Protein average is below the weekly target.")
    if fibre_score < 70:
        weaknesses.append("Fibre average is below the weekly target.")
    if alignment_score < 70:
        weaknesses.append("Several days do not align tightly with the selected goal tags.")
    if variety_score < 70:
        weaknesses.append("Recipe variety is low; consider swapping repeated dishes.")

    strengths: List[str] = []
    if protein_score >= 80:
        strengths.append("Protein is in a strong range.")
    if fibre_score >= 80:
        strengths.append("Fibre intake is in a strong range.")
    if alignment_score >= 80:
        strengths.append("Goal alignment is high across the week.")
    if variety_score >= 80:
        strengths.append("Recipe variety is healthy across the week.")

    pantry_usage = state.get("pantry_usage", {})
    overused = [name for name, count in pantry_usage.items() if count >= 4]
    if overused:
        weaknesses.append(
            "Pantry concentration is high for: " + ", ".join(overused[:3]) + "."
        )

    nutrition_eval = {
        "protein_score": round(protein_score, 1),
        "fibre_score": round(fibre_score, 1),
        "alignment_score": round(alignment_score, 1),
        "variety_score": round(variety_score, 1),
        "overall_score": round(overall, 1),
        "avg_protein_g": round(avg_protein, 1),
        "avg_fibre_g": round(avg_fibre, 1),
        "weaknesses": weaknesses,
        "strengths": strengths,
        "per_day_scores": per_day_scores,
    }

    target = float(state.get("target_score", 78.0))
    is_satisfactory = overall >= target

    trace = list(state.get("trace", []))
    trace.append(
        "Nutrition Evaluation Agent: "
        f"overall {overall:.1f}/100 "
        f"(protein {protein_score:.1f}, fibre {fibre_score:.1f}, alignment {alignment_score:.1f})."
    )

    return {
        **state,
        "nutrition_evaluation": nutrition_eval,
        "is_satisfactory": is_satisfactory,
        "error": None,
        "trace": trace,
    }

