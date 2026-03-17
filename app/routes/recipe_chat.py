from fastapi import APIRouter, HTTPException

from app.ai.chains import run_recipe_follow_up
from app.ai.retriever import retrieve_related_recipe_ids
from app.core.rate_limit import RateLimitError
from app.db.queries import find_recipe_by_id, find_recipes_by_ids
from app.models.request import RecipeChatRequest
from app.models.response import RecipeChatResponse
from app.routes.recommend import rate_limiter

router = APIRouter()


@router.post("/recipe-chat", response_model=RecipeChatResponse)
def recipe_chat(body: RecipeChatRequest):
    try:
        rate_limiter.check_request()
    except RateLimitError as error:
        raise HTTPException(status_code=429, detail=str(error))

    recipe = find_recipe_by_id(body.recipe_id)
    if not recipe:
        return RecipeChatResponse(
            answer="",
            status="NOT_FOUND",
            message="Recipe not found",
        )

    related_recipe_ids = retrieve_related_recipe_ids(
        query=f"{body.question} {recipe.get('recipe_name', '')}",
        k=3,
        exclude_recipe_ids=[body.recipe_id],
    )
    related_recipes = find_recipes_by_ids(related_recipe_ids)

    estimated_tokens = max(
        1,
        (
            len(str(recipe))
            + len(body.question)
            + sum(len(str(related_recipe)) for related_recipe in related_recipes)
        )
        // 4,
    )
    try:
        rate_limiter.check_tokens(estimated_tokens)
    except RateLimitError as error:
        raise HTTPException(status_code=429, detail=str(error))

    answer = run_recipe_follow_up(
        recipe=recipe,
        question=body.question,
        related_recipes=related_recipes,
    )

    return RecipeChatResponse(answer=answer, status="OK")
