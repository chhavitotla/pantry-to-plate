import pickle
from pathlib import Path
import time

import faiss
from langchain_community.vectorstores import FAISS as LCFAISS

from app.ai.embeddings import get_query_embedding_model
from app.core.config import settings
from app.db.mongo import get_collection


def recipe_to_text(recipe: dict) -> str:
    recipe_name = str(recipe.get("recipe_name") or recipe.get("title", "")).strip()
    description = str(recipe.get("description", "")).strip()
    ingredients = ", ".join(
        str(ing.get("item", "")).strip()
        for ing in recipe.get("ingredients", [])
        if isinstance(ing, dict)
    )
    meal_type = " ".join(str(x) for x in recipe.get("meal_type", []))
    dietary_type = " ".join(str(x) for x in recipe.get("dietary_type", []))
    nutrition_profile = " ".join(str(x) for x in recipe.get("nutrition_profile", []))
    time_effort_tags = " ".join(str(x) for x in recipe.get("time_effort_tags", []))

    parts = [
        recipe_name,
        description,
        f"ingredients: {ingredients}" if ingredients else "",
        f"meal type: {meal_type}" if meal_type else "",
        f"dietary type: {dietary_type}" if dietary_type else "",
        f"nutrition profile: {nutrition_profile}" if nutrition_profile else "",
        f"time effort: {time_effort_tags}" if time_effort_tags else "",
    ]

    return " | ".join(p for p in parts if p)


def load_recipes() -> list[dict]:
    coll = get_collection()
    projection = {
        "_id": 0,
        "recipe_id": 1,
        "recipe_name": 1,
        "title": 1,
        "description": 1,
        "ingredients": 1,
        "meal_type": 1,
        "dietary_type": 1,
        "nutrition_profile": 1,
        "time_effort_tags": 1,
    }
    docs = list(coll.find({}, projection))
    return [d for d in docs if d.get("recipe_id")]


# 🔥 SAFE EMBEDDING FUNCTION (handles rate limits)
def safe_embed(embedder, chunk, batch_size=20):
    retry_delay = 20  # initial wait
    max_delay = 120

    while True:
        try:
            return embedder.embed_documents(chunk, batch_size=batch_size)

        except Exception as e:
            print(f"⚠️ Rate limit hit. Retrying in {retry_delay}s...")
            time.sleep(retry_delay)

            # exponential backoff (20 → 40 → 80 → 120)
            retry_delay = min(retry_delay * 2, max_delay)


def build_faiss() -> None:
    recipes = load_recipes()
    if not recipes:
        raise RuntimeError("No recipes found in Mongo collection. Load dataset first.")

    texts = [recipe_to_text(r) for r in recipes]
    metadatas = [{"recipe_id": r["recipe_id"]} for r in recipes]

    embedder = get_query_embedding_model()

    vectors = []
    chunk_size = 80

    print(f"Starting embedding for {len(texts)} recipes...")

    for start in range(0, len(texts), chunk_size):
        chunk = texts[start: start + chunk_size]

        print(f"Processing chunk {start} → {start + len(chunk)}")

        chunk_vectors = safe_embed(embedder, chunk, batch_size=20)
        vectors.extend(chunk_vectors)

    print("All embeddings completed.")

    text_embeddings = list(zip(texts, vectors))

    vector_store = LCFAISS.from_embeddings(
        text_embeddings=text_embeddings,
        embedding=embedder,
        metadatas=metadatas,
    )

    index_path = Path(settings.faiss_index_path)
    map_path = Path(settings.faiss_mapping_path)

    index_path.parent.mkdir(parents=True, exist_ok=True)
    map_path.parent.mkdir(parents=True, exist_ok=True)

    faiss.write_index(vector_store.index, str(index_path))

    index_to_recipe_id = {}

    for idx, docstore_id in vector_store.index_to_docstore_id.items():
        doc = vector_store.docstore.search(docstore_id)
        recipe_id = doc.metadata.get("recipe_id") if doc and doc.metadata else None

        if recipe_id is not None:
            index_to_recipe_id[int(idx)] = recipe_id

    with map_path.open("wb") as f:
        pickle.dump(index_to_recipe_id, f)

    print(f"\n✅ Built FAISS index for {len(index_to_recipe_id)} recipes")
    print(f"📦 Index: {index_path}")
    print(f"🗺️ Mapping: {map_path}")


if __name__ == "__main__":
    build_faiss()