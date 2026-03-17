from typing import Dict, Any, List, Tuple


def primary_ingredient(recipe: Dict[str, Any]) -> str:
    ingredients = recipe.get("ingredients", [])
    if not ingredients:
        return ""
    return str(ingredients[0].get("item", "")).strip().lower()


def diversity_prune(recipes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen: set[Tuple[str, Tuple[str, ...], Tuple[str, ...]]] = set()
    pruned: List[Dict[str, Any]] = []

    for r in recipes:
        prim = primary_ingredient(r)
        meal = tuple(sorted([s.lower() for s in r.get("meal_type", [])]))
        nutr = tuple(sorted([s.lower() for s in r.get("nutrition_profile", [])]))
        key = (prim, meal, nutr)

        if key in seen:
            continue

        seen.add(key)
        pruned.append(r)

    return pruned
