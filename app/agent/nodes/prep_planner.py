import json
from typing import Any, Dict, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.agent.state import MealPlanState
from app.agent.prompts import PREP_PLANNER_SYSTEM_PROMPT, PREP_PLANNER_HUMAN_PROMPT
from app.core.config import settings


def _build_prep_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gem_key_two,
        temperature=0.3,
    )


def _merge_ingredients(recipes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Flatten ingredients across all selected recipes into a single list.
    Keeps recipe_name alongside each ingredient so the LLM has context
    on which ingredient belongs to which dish.
    """
    merged: List[Dict[str, Any]] = []
    for recipe in recipes:
        recipe_name = str(recipe.get("recipe_name", ""))
        for ing in recipe.get("ingredients", []):
            if isinstance(ing, dict):
                merged.append(
                    {
                        "item":        str(ing.get("item", "")).strip(),
                        "quantity":    str(ing.get("quantity", "")).strip(),
                        "recipe_name": recipe_name,
                    }
                )
    return merged


def run_prep_planner_node(state: MealPlanState) -> MealPlanState:
    selected: List[Dict[str, Any]] = state["selected_recipes"]

    if not selected:
        return {
            **state,
            "day_0_prep": [],
            "error": "No selected recipes available for prep planning.",
        }

    merged_ingredients = _merge_ingredients(selected)

    recipe_names = [str(r.get("recipe_name", "")) for r in selected]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", PREP_PLANNER_SYSTEM_PROMPT),
            ("human",  PREP_PLANNER_HUMAN_PROMPT),
        ]
    )

    chain  = prompt | _build_prep_llm()
    result = chain.invoke(
        {
            "recipe_names":        json.dumps(recipe_names, ensure_ascii=False),
            "merged_ingredients":  json.dumps(merged_ingredients, ensure_ascii=False, default=str),
        }
    )

    # ── parse LLM output — expect a JSON array of step strings ─────────
    raw = result.content.strip()

    try:
        # strip markdown fences if model wraps in ```json ... ```
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        day_0_prep: List[str] = json.loads(raw.strip())
        if not isinstance(day_0_prep, list):
            raise ValueError("Expected a JSON array.")
    except Exception as parse_error:
        return {
            **state,
            "day_0_prep": [],
            "error": f"Prep planner LLM output parse failed: {parse_error}. Raw: {raw[:300]}",
        }

    return {
        **state,
        "day_0_prep": day_0_prep,
        "error":      None,
    }