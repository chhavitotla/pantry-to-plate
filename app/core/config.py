from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="app/.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    mongo_uri: str = Field(
        default="mongodb://localhost:27017",
        validation_alias=AliasChoices("MONGO_URI", "mongo_uri"),
    )
    mongo_db: str = Field(
        default="pantry_ai",
        validation_alias=AliasChoices("MONGO_DB", "mongo_db"),
    )
    mongo_collection: str = Field(
        default="recipes",
        validation_alias=AliasChoices("MONGO_COLLECTION", "mongo_collection"),
    )

    gemini_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("GEMINI_API_KEY", "gemini_api_key"),
    )

    faiss_index_path: str = Field(
        default="app/ai/faiss_index/recipes.faiss",
        validation_alias=AliasChoices("FAISS_INDEX_PATH", "faiss_index_path"),
    )
    faiss_mapping_path: str = Field(
        default="app/ai/faiss_index/index_to_recipe_id.pkl",
        validation_alias=AliasChoices("FAISS_MAPPING_PATH", "faiss_mapping_path"),
    )

    requests_per_minute: int = Field(
        default=20,
        validation_alias=AliasChoices("REQUESTS_PER_MINUTE", "requests_per_minute"),
    )
    tokens_per_minute: int = Field(
        default=40000,
        validation_alias=AliasChoices("TOKENS_PER_MINUTE", "tokens_per_minute"),
    )
    redis_host: str = Field(
        default="localhost",
        validation_alias=AliasChoices("REDIS_HOST", "redis_host"),
    )
    redis_port: int = Field(
        default=6379,
        validation_alias=AliasChoices("REDIS_PORT", "redis_port"),
    )
    redis_db: int = Field(
        default=0,
        validation_alias=AliasChoices("REDIS_DB", "redis_db"),
    )
settings = Settings()