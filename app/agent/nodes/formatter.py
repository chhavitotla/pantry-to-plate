from typing import Any, Dict, List

from app.agent.state import MealPlanState


def run_formatter_node(state: MealPlanState) -> MealPlanState:
    day_0_prep: List[str]       = state.get("day_0_prep", [])
    daily_plan: Dict[str, Any]  = state.get("daily_plan", {})
    selected:   List[Any]       = state.get("selected_recipes", [])

    # ── build notes from selected recipe metadata ──────────────────────
    notes: List[str] = []

    for recipe in selected:
        recipe_name     = str(recipe.get("recipe_name", ""))
        nutrition       = recipe.get("nutrition_profile", [])
        time_effort     = recipe.get("time_effort_tags", [])
        macros          = recipe.get("macros_per_serving", {})

        if nutrition or time_effort:
            tags = ", ".join(nutrition + time_effort)
            notes.append(f"{recipe_name}: {tags}")

        if macros:
            cal     = macros.get("calories_kcal", "")
            protein = macros.get("protein_g", "")
            if cal and protein:
                notes.append(
                    f"{recipe_name} — {cal} kcal, {protein}g protein per serving"
                )

    # ── assemble final output matching the spec'd JSON structure ───────
    final_output: Dict[str, Any] = {
        "day_0_prep": day_0_prep,
        "days":       daily_plan,
        "notes":      notes,
    }

    return {
        **state,
        "final_output": final_output,
        "error":        None,
    }