from typing import List, Dict, Any, Optional
from app.db.mongo import get_collection


def _normalize_text(text: str) -> str:
    normalized = text.strip().lower().translate({ord(c): "" for c in ".,-/()"})
    return " ".join(normalized.split())


def _pantry_terms(items: List[str]) -> List[str]:
    terms: List[str] = []
    seen: set[str] = set()

    for item in items:
        normalized = _normalize_text(item)
        for term in normalized.split():
            if term and term not in seen:
                seen.add(term)
                terms.append(term)

    return terms


def _ingredient_matches_pantry(ingredient: str, pantry_terms: List[str]) -> bool:
    ingredient_terms = set(_normalize_text(ingredient).split())
    return bool(ingredient_terms.intersection(pantry_terms))


def _normalize_mongo_expr(field_expr):
    expr = field_expr
    for ch in [".", ",", "-", "/", "(", ")"]:
        expr = {
            "$replaceAll": {
                "input": expr,
                "find": ch,
                "replacement": "",
            }
        }
    return {"$trim": {"input": {"$toLower": expr}}}


def find_filtered_recipes(
    pantry_items: List[str],
    dietary_type: str,
    meal_type: str,
    max_time_minutes: int,
    allergies: List[str],
) -> List[Dict[str, Any]]:
    coll = get_collection()

    pantry_terms = _pantry_terms(pantry_items)

    pipeline = [
        {
            "$match": {
                "dietary_type": dietary_type,
                "meal_type": meal_type,
                "time.total_time_minutes": {"$lte": max_time_minutes},
                "allergens": {"$nin": allergies},
            }
        },
        {
            "$addFields": {
                "ingredients_norm": {
                    "$map": {
                        "input": "$ingredients",
                        "as": "ing",
                        "in": _normalize_mongo_expr("$$ing.item"),
                    }
                }
            }
        },
        {
            "$addFields": {
                "ingredient_terms": {
                    "$map": {
                        "input": "$ingredients_norm",
                        "as": "ing",
                        "in": {
                            "$filter": {
                                "input": {"$split": ["$$ing", " "]},
                                "as": "term",
                                "cond": {"$ne": ["$$term", ""]},
                            }
                        },
                    }
                }
            }
        },
        {
            "$addFields": {
                "matched_ingredient_count": {
                    "$size": {
                        "$filter": {
                            "input": "$ingredient_terms",
                            "as": "ing_terms",
                            "cond": {
                                "$gt": [
                                    {"$size": {"$setIntersection": ["$$ing_terms", pantry_terms]}},
                                    0,
                                ]
                            },
                        }
                    }
                }
            }
        },
        {
            "$addFields": {
                "pantry_match": {
                    "$cond": [
                        {"$gt": [{"$size": "$ingredient_terms"}, 0]},
                        {
                            "$divide": [
                                "$matched_ingredient_count",
                                {"$size": "$ingredient_terms"},
                            ]
                        },
                        0,
                    ]
                }
            }
        },
        {"$match": {"pantry_match": {"$gte": 0.2}}},
    ]

    return list(coll.aggregate(pipeline))


def find_recipe_by_id(recipe_id: str) -> Optional[Dict[str, Any]]:
    coll = get_collection()
    return coll.find_one({"recipe_id": recipe_id})


def find_recipes_by_ids(recipe_ids: List[str]) -> List[Dict[str, Any]]:
    if not recipe_ids:
        return []

    coll = get_collection()
    recipes = list(coll.find({"recipe_id": {"$in": recipe_ids}}))
    by_id = {str(recipe.get("recipe_id", "")): recipe for recipe in recipes}
    return [by_id[rid] for rid in recipe_ids if rid in by_id]
