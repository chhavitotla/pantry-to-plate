from typing import Any, Dict, List

from app.agent.state import MealPlanState
from app.core.diversity import diversity_prune

_GOAL_PROFILE_MAP: Dict[str, List[str]] = {
    "high_protein": ["protein_rich"],
    "high_fiber":   ["high_fiber"],
    "balanced":     ["balanced"],
}

MAX_RECIPES = 5
MIN_RECIPES = 3


def _primary_ingredient(recipe: Dict[str, Any]) -> str:
    ingredients = recipe.get("ingredients", [])
    if not ingredients:
        return ""
    return str(ingredients[0].get("item", "")).strip().lower()


def _goal_score(recipe: Dict[str, Any], goal: str) -> int:
    """Returns 1 if recipe nutrition_profile satisfies the goal, else 0."""
    target_tags = _GOAL_PROFILE_MAP.get(goal, [])
    if not target_tags:
        return 0
    recipe_profile = {t.lower() for t in recipe.get("nutrition_profile", [])}
    return 1 if recipe_profile.intersection(target_tags) else 0


def _pantry_match_score(recipe: Dict[str, Any]) -> float:
    """Reuse pantry_match already computed by mongo aggregation pipeline."""
    return float(recipe.get("pantry_match", 0.0))


def run_selection_node(state: MealPlanState) -> MealPlanState:
    filtered: List[Dict[str, Any]] = state["filtered_recipes"]

    if not filtered:
        return {
            **state,
            "selected_recipes": [],
            "error": "No recipes passed to selection node.",
        }

    # ── step 1: sort by goal match first, pantry_match as tiebreaker ──
    goal = state.get("goal", "balanced")
    sorted_recipes = sorted(
        filtered,
        key=lambda r: (_goal_score(r, goal), _pantry_match_score(r)),
        reverse=True,
    )

    # ── step 2: diversity prune using existing diversity.py logic ──────
    diverse: List[Dict[str, Any]] = diversity_prune(sorted_recipes)

    # ── step 3: cap at MAX_RECIPES ─────────────────────────────────────
    selected = diverse[:MAX_RECIPES]

    # ── step 4: guard — fewer than MIN_RECIPES is an error ────────────
    if len(selected) < MIN_RECIPES:
        return {
            **state,
            "selected_recipes": [],
            "error": (
                f"Not enough diverse recipes found ({len(selected)}). "
                f"Minimum required is {MIN_RECIPES}."
            ),
        }

    return {
        **state,
        "selected_recipes": selected,
        "error": None,
    }