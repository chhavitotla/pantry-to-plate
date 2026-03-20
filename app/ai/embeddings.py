from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.config import settings


def get_query_embedding_model(use_agent_key: bool = False):
    api_key = settings.gem_key_two if use_agent_key else settings.gemini_api_key
    return GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-001",
        google_api_key=api_key,
    )
