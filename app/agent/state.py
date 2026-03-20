from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict


class MealPlanState(TypedDict):
    # ── user inputs ────────────────────────────────────────────────────
    pantry_items: List[str]
    meal_type: str
    goal: str
    allergies: List[str]
    dietary_type: str

    # ── upstream recipe candidates ─────────────────────────────────────
    filtered_recipes: List[Dict[str, Any]]
    rag_recipes: List[Dict[str, Any]]
    selected_recipes: List[Dict[str, Any]]

    # ── iterative planning state ───────────────────────────────────────
    daily_plan: Dict[str, Any]
    pantry_usage: Dict[str, int]
    nutrition_evaluation: Dict[str, Any]
    day_0_prep: List[str]

    iteration: int
    max_iterations: int
    target_score: float
    is_satisfactory: bool

    # ── observability / explainability ─────────────────────────────────
    trace: List[str]
    final_output: Optional[Dict[str, Any]]

    # ── error propagation ──────────────────────────────────────────────
    error: Optional[str]
