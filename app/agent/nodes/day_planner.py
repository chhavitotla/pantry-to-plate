import json
from typing import Any, Dict, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.agent.state import MealPlanState
from app.agent.prompts import DAY_PLANNER_SYSTEM_PROMPT, DAY_PLANNER_HUMAN_PROMPT
from app.core.config import settings


def _build_day_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gem_key_two,
        temperature=0.3,
    )


def run_day_planner_node(state: MealPlanState) -> MealPlanState:
    selected:   List[Dict[str, Any]] = state["selected_recipes"]
    day_0_prep: List[str]            = state["day_0_prep"]

    if not selected:
        return {
            **state,
            "daily_plan": {},
            "error": "No selected recipes available for day planning.",
        }

    if not day_0_prep:
        return {
            **state,
            "daily_plan": {},
            "error": "Day 0 prep is empty. Prep planner must run first.",
        }

    # ── strip heavy mongo fields before sending to LLM ─────────────────
    # only pass what the LLM actually needs
    slim_recipes = [
        {
            "recipe_name": str(r.get("recipe_name", "")),
            "ingredients": r.get("ingredients", []),
            "steps":       r.get("steps", []),
        }
        for r in selected
    ]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", DAY_PLANNER_SYSTEM_PROMPT),
            ("human",  DAY_PLANNER_HUMAN_PROMPT),
        ]
    )

    chain  = prompt | _build_day_llm()
    result = chain.invoke(
        {
            "selected_recipes": json.dumps(slim_recipes, ensure_ascii=False, default=str),
            "day_0_prep":       json.dumps(day_0_prep,   ensure_ascii=False),
            "goal":             state.get("goal", "balanced"),
            "meal_type":        state.get("meal_type", ""),
        }
    )

    # ── parse LLM output — expect a JSON object keyed day_1 … day_N ───
    raw = result.content.strip()

    try:
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        daily_plan: Dict[str, Any] = json.loads(raw.strip())
        if not isinstance(daily_plan, dict):
            raise ValueError("Expected a JSON object.")
    except Exception as parse_error:
        return {
            **state,
            "daily_plan": {},
            "error": f"Day planner LLM output parse failed: {parse_error}. Raw: {raw[:300]}",
        }

    return {
        **state,
        "daily_plan": daily_plan,
        "error":      None,
    }