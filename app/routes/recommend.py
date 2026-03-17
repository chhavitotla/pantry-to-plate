from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from app.models.request import RecommendRequest
from app.models.response import RecommendResponse, RecipeResponse
from app.db.queries import find_filtered_recipes
from app.core.scoring import score_recipe
from app.core.diversity import diversity_prune
from app.core.rate_limit import RateLimiter, RateLimitError
from app.ai.retriever import retrieve_similar_recipe_ids
from app.ai.chains import run_llm

router = APIRouter()
rate_limiter = RateLimiter()
TIME_PREFERENCE_TAGS = {"under_30_minutes", "under_45_minutes"}

def _normalize_list(items: List[str]) -> List[str]:
    normalized = []
    for i in items:
        s = i.strip().lower()
        for ch in ".,-/()":
            s = s.replace(ch, "")
        normalized.append(s)
    return normalized


def _serialize_recipe(recipe: Dict[str, Any]) -> RecipeResponse:
    return RecipeResponse(
        recipe_id=str(recipe.get("recipe_id", "")),
        recipe_name=str(recipe.get("recipe_name") or recipe.get("title") or ""),
        allergens=list(recipe.get("allergens", [])),
        dietary_type=list(recipe.get("dietary_type", [])),
        ingredients=list(recipe.get("ingredients", [])),
        macros_per_serving=dict(recipe.get("macros_per_serving", {})),
        meal_type=list(recipe.get("meal_type", [])),
        nutrition_profile=list(recipe.get("nutrition_profile", [])),
        serving=dict(recipe.get("serving", {})),
        steps=list(recipe.get("steps", [])),
        time=dict(recipe.get("time", {})),
        time_effort_tags=list(recipe.get("time_effort_tags", [])),
    )


def _effective_preference_tags(tags: List[str]) -> List[str]:
    return [tag for tag in tags if tag not in TIME_PREFERENCE_TAGS]


def _build_semantic_query(body: RecommendRequest) -> str:
    parts: List[str] = []
    preference_tags = _effective_preference_tags(body.nutrition_preferences)

    if body.pantry_items:
        parts.append(f"ingredients: {', '.join(body.pantry_items)}")
    if body.meal_type:
        parts.append(f"meal type: {body.meal_type}")
    if body.dietary_type:
        parts.append(f"dietary type: {body.dietary_type}")
    if preference_tags:
        parts.append(f"preference tags: {', '.join(preference_tags)}")
    if body.max_time_minutes > 0:
        parts.append(f"time: under {body.max_time_minutes} minutes")

    return " | ".join(parts)


@router.post("/recommend", response_model=RecommendResponse)
def recommend(
    body: RecommendRequest,
):
    try:
        rate_limiter.check_request()
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))

    pantry_norm = _normalize_list(body.pantry_items)
    allergies_norm = _normalize_list(body.allergies)
    nutrition_prefs_norm = _effective_preference_tags(_normalize_list(body.nutrition_preferences))

    recipes = find_filtered_recipes(
        pantry_items=pantry_norm,
        dietary_type=body.dietary_type,
        meal_type=body.meal_type,
        max_time_minutes=body.max_time_minutes,
        allergies=allergies_norm,
    )

    if not recipes:
        return RecommendResponse(
            recipes=[],
            status="NO_MATCH",
            message="No recipes match your pantry and constraints",
        )

    for r in recipes:
        # Keep the heuristic score as a fallback for recipes missing from the vector index.
        r["fallback_score"] = score_recipe(r, body.max_time_minutes, nutrition_prefs_norm)

    candidate_ids = [r["recipe_id"] for r in recipes]

    retrieved_ids = retrieve_similar_recipe_ids(
        query=_build_semantic_query(body),
        candidate_recipe_ids=candidate_ids,
        k=len(candidate_ids),
    )

    recipes_by_id = {r["recipe_id"]: r for r in recipes}
    semantic_ranked: List[Dict[str, Any]] = []
    seen_ids: set[str] = set()

    for recipe_id in retrieved_ids:
        recipe = recipes_by_id.get(recipe_id)
        if recipe is None or recipe_id in seen_ids:
            continue
        semantic_ranked.append(recipe)
        seen_ids.add(recipe_id)

    remaining = [r for r in recipes if r["recipe_id"] not in seen_ids]
    remaining.sort(key=lambda r: r.get("fallback_score", 0.0), reverse=True)

    ranked_recipes = diversity_prune(semantic_ranked + remaining)
    top_candidates = ranked_recipes[:20]
    top_recipe = top_candidates[0]

    estimated_tokens = max(1, len(str(top_recipe)) // 4)
    try:
        rate_limiter.check_tokens(estimated_tokens)
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail=str(e))

    assistant_response = run_llm(top_recipe)
    return RecommendResponse(
        recipes=[_serialize_recipe(recipe) for recipe in top_candidates],
        status="OK",
        assistant_response=assistant_response,
    )
