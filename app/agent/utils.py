from __future__ import annotations

import re
from collections import Counter
from typing import Any, Dict, Iterable, List, Tuple


def normalize_text(text: str) -> str:
    cleaned = text.strip().lower()
    for ch in ".,-/()":
        cleaned = cleaned.replace(ch, "")
    return " ".join(cleaned.split())


def day_sort_key(day_key: str) -> int:
    match = re.search(r"(\d+)$", day_key)
    if not match:
        return 999
    return int(match.group(1))


def sort_days(days: Dict[str, Any]) -> Dict[str, Any]:
    return {
        day_key: days[day_key]
        for day_key in sorted(days.keys(), key=day_sort_key)
    }


def build_recipe_lookups(
    recipes: Iterable[Dict[str, Any]],
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Dict[str, Any]]]:
    by_id: Dict[str, Dict[str, Any]] = {}
    by_name: Dict[str, Dict[str, Any]] = {}
    for recipe in recipes:
        rid = str(recipe.get("recipe_id", "")).strip()
        name = str(recipe.get("recipe_name", "")).strip()
        if rid:
            by_id[rid] = recipe
        if name:
            by_name[normalize_text(name)] = recipe
    return by_id, by_name


def extract_recipe_steps(recipe: Dict[str, Any], limit: int = 3) -> List[str]:
    steps = [str(step).strip() for step in recipe.get("steps", []) if str(step).strip()]
    if steps:
        return steps[:limit]
    recipe_name = str(recipe.get("recipe_name", "the dish")).strip() or "the dish"
    return [
        f"Warm the pan and prep ingredients for {recipe_name}.",
        f"Cook {recipe_name} on medium heat until done.",
        "Finish with seasoning and serve hot.",
    ]


def build_day_plan_entry(recipe: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "recipe_id": str(recipe.get("recipe_id", "")),
        "recipe": str(recipe.get("recipe_name", "")),
        "steps": extract_recipe_steps(recipe),
    }


def find_recipe_for_day(
    day_data: Dict[str, Any],
    recipes_by_id: Dict[str, Dict[str, Any]],
    recipes_by_name: Dict[str, Dict[str, Any]],
) -> Dict[str, Any] | None:
    recipe_id = str(day_data.get("recipe_id", "")).strip()
    if recipe_id and recipe_id in recipes_by_id:
        return recipes_by_id[recipe_id]

    recipe_name = normalize_text(str(day_data.get("recipe", "")))
    if recipe_name and recipe_name in recipes_by_name:
        return recipes_by_name[recipe_name]

    return None


def pantry_overlap_count(recipe: Dict[str, Any], pantry_items: List[str]) -> int:
    pantry_terms = set()
    for item in pantry_items:
        pantry_terms.update(normalize_text(item).split())

    if not pantry_terms:
        return 0

    overlap = 0
    for ingredient in recipe.get("ingredients", []):
        name = normalize_text(str(ingredient.get("item", "")))
        ingredient_terms = set(name.split())
        if ingredient_terms.intersection(pantry_terms):
            overlap += 1
    return overlap


def goal_tag_hit(recipe: Dict[str, Any], goal: str) -> bool:
    tags = {normalize_text(str(tag)) for tag in recipe.get("nutrition_profile", [])}
    if goal == "high_protein":
        return "protein_rich" in tags
    if goal == "high_fiber":
        return "high_fiber" in tags or "fibre_rich" in tags
    return "balanced" in tags


def recipe_goal_score(recipe: Dict[str, Any], goal: str) -> float:
    macros = recipe.get("macros_per_serving", {}) or {}
    protein = float(macros.get("protein_g") or 0.0)
    fibre = float(macros.get("fibre_g") or 0.0)
    pantry_match = float(recipe.get("pantry_match") or 0.0)
    tag_bonus = 8.0 if goal_tag_hit(recipe, goal) else 0.0

    if goal == "high_protein":
        nutrition = min(35.0, protein * 1.2) + min(15.0, fibre * 1.2)
    elif goal == "high_fiber":
        nutrition = min(18.0, protein * 0.7) + min(38.0, fibre * 2.2)
    else:
        nutrition = min(25.0, protein * 0.9) + min(25.0, fibre * 1.6)

    return nutrition + (pantry_match * 30.0) + tag_bonus


def build_day0_prep_from_recipes(recipes: List[Dict[str, Any]]) -> List[str]:
    ingredient_counter: Counter[str] = Counter()
    for recipe in recipes:
        for ingredient in recipe.get("ingredients", []):
            item = normalize_text(str(ingredient.get("item", "")))
            if item:
                ingredient_counter[item] += 1

    repeated = [name for name, count in ingredient_counter.most_common() if count >= 2][:5]
    prep_steps: List[str] = []

    if repeated:
        prep_steps.append(
            f"Wash and prep shared ingredients first: {', '.join(repeated)}."
        )
        prep_steps.append(
            "Batch-chop onions, peppers, and other aromatics; store in airtight boxes."
        )

    prep_steps.extend(
        [
            "Pre-measure common spices, salt, and oil into a ready-to-cook tray.",
            "Label containers by day so each dinner finishes faster on weekdays.",
        ]
    )

    deduped: List[str] = []
    seen: set[str] = set()
    for step in prep_steps:
        marker = normalize_text(step)
        if marker and marker not in seen:
            seen.add(marker)
            deduped.append(step)

    return deduped[:6]

