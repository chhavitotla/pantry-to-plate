from typing import Any, Dict, List

from app.agent.state import MealPlanState
from app.agent.utils import (
    build_day0_prep_from_recipes,
    build_recipe_lookups,
    find_recipe_for_day,
    sort_days,
)


def run_formatter_node(state: MealPlanState) -> MealPlanState:
    daily_plan = sort_days(state.get("daily_plan", {}))
    candidate_pool = state.get("rag_recipes") or state.get("filtered_recipes", [])
    recipes_by_id, recipes_by_name = build_recipe_lookups(candidate_pool)

    recipes_in_plan: List[Dict[str, Any]] = []
    serialized_days: Dict[str, Dict[str, Any]] = {}
    for day_key, day_data in daily_plan.items():
        recipe = find_recipe_for_day(day_data, recipes_by_id, recipes_by_name)
        if recipe:
            recipes_in_plan.append(recipe)

        serialized_days[day_key] = {
            "recipe": str(day_data.get("recipe", "")),
            "steps": [str(step).strip() for step in day_data.get("steps", []) if str(step).strip()],
            "recipe_id": str(day_data.get("recipe_id", "")),
        }

    day_0_prep = state.get("day_0_prep") or build_day0_prep_from_recipes(recipes_in_plan)
    nutrition_eval = state.get("nutrition_evaluation", {})
    overall = nutrition_eval.get("overall_score")
    protein_score = nutrition_eval.get("protein_score")
    fibre_score = nutrition_eval.get("fibre_score")
    alignment_score = nutrition_eval.get("alignment_score")
    weaknesses = list(nutrition_eval.get("weaknesses", []))

    notes: List[str] = []
    if overall is not None:
        notes.append(
            f"Overall nutrition score: {overall}/100 (protein {protein_score}, fibre {fibre_score}, alignment {alignment_score})."
        )
    for weakness in weaknesses[:3]:
        notes.append(f"Watch-out: {weakness}")

    trace = list(state.get("trace", []))
    trace.append(
        "Formatter Agent: packaged final meal plan, prep checklist, nutrition notes, and trace."
    )

    final_output: Dict[str, Any] = {
        "day_0_prep": day_0_prep,
        "days": serialized_days,
        "notes": notes,
        "trace": trace,
        "nutrition_scores": {
            "overall": overall,
            "protein": protein_score,
            "fibre": fibre_score,
            "alignment": alignment_score,
        },
    }

    return {
        **state,
        "day_0_prep": day_0_prep,
        "final_output": final_output,
        "trace": trace,
        "error": None,
    }
