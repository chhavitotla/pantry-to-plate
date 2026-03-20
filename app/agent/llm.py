from __future__ import annotations

import json
from typing import Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings


def build_agent_llm(temperature: float = 0.2) -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gem_key_two,
        temperature=temperature,
    )


def parse_json_output(raw_content: str) -> Any:
    raw = raw_content.strip()
    if raw.startswith("```"):
        chunks = raw.split("```")
        if len(chunks) >= 2:
            raw = chunks[1]
        if raw.lstrip().startswith("json"):
            raw = raw.lstrip()[4:]
    return json.loads(raw.strip())


def invoke_json_prompt(
    system_prompt: str,
    human_prompt: str,
    payload: dict[str, Any],
    temperature: float = 0.2,
) -> Any:
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", human_prompt),
        ]
    )
    chain = prompt | build_agent_llm(temperature=temperature)
    result = chain.invoke(payload)
    return parse_json_output(str(result.content))

