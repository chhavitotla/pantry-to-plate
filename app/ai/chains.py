import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
from app.ai.prompts import (
    FOLLOW_UP_HUMAN_PROMPT,
    FOLLOW_UP_SYSTEM_PROMPT,
    HUMAN_PROMPT,
    SYSTEM_PROMPT,
)


def build_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0.0,
    )


def run_llm(recipe: dict) -> str:
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("human", HUMAN_PROMPT),
        ]
    )
    chain = prompt | build_llm()
    return chain.invoke(
        {"recipe_json": json.dumps(recipe, ensure_ascii=False, default=str)}
    ).content


def run_recipe_follow_up(recipe: dict, question: str, related_recipes: list[dict]) -> str:
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", FOLLOW_UP_SYSTEM_PROMPT),
            ("human", FOLLOW_UP_HUMAN_PROMPT),
        ]
    )
    chain = prompt | build_llm()
    return chain.invoke(
        {
            "recipe_json": json.dumps(recipe, ensure_ascii=False, default=str),
            "related_recipes_json": json.dumps(
                related_recipes,
                ensure_ascii=False,
                default=str,
            ),
            "question": question,
        }
    ).content
