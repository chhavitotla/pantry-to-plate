from typing import List, Dict, Any
import pickle
import numpy as np
import faiss
from app.core.config import settings
from app.ai.embeddings import get_query_embedding_model


def _load_faiss():
    index = faiss.read_index(settings.faiss_index_path)
    with open(settings.faiss_mapping_path, "rb") as f:
        index_to_recipe = pickle.load(f)
    recipe_to_index = {v: k for k, v in index_to_recipe.items()}
    return index, index_to_recipe, recipe_to_index


def retrieve_similar_recipe_ids(
    query: str,
    candidate_recipe_ids: List[str],
    k: int,
) -> List[str]:
    index, index_to_recipe, recipe_to_index = _load_faiss()
    embedder = get_query_embedding_model()

    query_vec = np.array(embedder.embed_query(query), dtype="float32").reshape(1, -1)

    candidate_ids = [recipe_to_index[rid] for rid in candidate_recipe_ids if rid in recipe_to_index]
    if not candidate_ids:
        return []

    dim = query_vec.shape[1]
    sub_index = faiss.IndexFlatIP(dim)

    vectors = []
    valid_ids = []
    for idx in candidate_ids:
        vec = np.array(index.reconstruct(idx), dtype="float32")
        vectors.append(vec)
        valid_ids.append(idx)

    matrix = np.stack(vectors, axis=0)
    faiss.normalize_L2(matrix)
    faiss.normalize_L2(query_vec)

    sub_index.add(matrix)
    scores, positions = sub_index.search(query_vec, min(k, len(valid_ids)))

    results: List[str] = []
    for pos in positions[0]:
        idx = valid_ids[int(pos)]
        results.append(index_to_recipe[idx])

    return results


def retrieve_related_recipe_ids(
    query: str,
    k: int,
    exclude_recipe_ids: List[str] | None = None,
) -> List[str]:
    index, index_to_recipe, _recipe_to_index = _load_faiss()
    embedder = get_query_embedding_model()

    query_vec = np.array(embedder.embed_query(query), dtype="float32").reshape(1, -1)
    faiss.normalize_L2(query_vec)

    scores, positions = index.search(query_vec, min(max(k * 3, k), index.ntotal))

    excluded = set(exclude_recipe_ids or [])
    results: List[str] = []
    for pos in positions[0]:
        recipe_id = index_to_recipe.get(int(pos))
        if not recipe_id or recipe_id in excluded or recipe_id in results:
            continue
        results.append(recipe_id)
        if len(results) >= k:
            break

    return results
