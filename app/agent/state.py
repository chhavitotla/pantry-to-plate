from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict


class MealPlanState(TypedDict):
    # ── inputs from the route ──────────────────────────────────────────
    pantry_items:     List[str]
    meal_type:        str                  # breakfast / lunch / dinner
    goal:             str                  # high_protein / high_fiber / balanced
    allergies:        List[str]
    dietary_type:     str                  # vegetarian / vegan / non-vegetarian

    # ── recipes handed in after mongo + faiss (upstream, not agent's job) ──
    filtered_recipes: List[Dict[str, Any]]

    # ── selection node output ──────────────────────────────────────────
    selected_recipes: List[Dict[str, Any]]  # up to 5

    # ── prep planning node output ──────────────────────────────────────
    day_0_prep:       List[str]             # consolidated prep steps

    # ── day planner node output ────────────────────────────────────────
    daily_plan:       Dict[str, Any]        # day_1 … day_N keyed dict

    # ── formatter node output (final) ─────────────────────────────────
    final_output:     Optional[Dict[str, Any]]

    # ── error propagation ──────────────────────────────────────────────
    error:            Optional[str]