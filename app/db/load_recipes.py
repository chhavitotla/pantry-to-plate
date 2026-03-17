import json
import sys
from pathlib import Path
from pymongo import UpdateOne
from app.db.mongo import get_collection


def main():
    json_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data/recipes.json")
    with json_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    recipes = data["recipes"] if isinstance(data, dict) and "recipes" in data else data
    if not isinstance(recipes, list):
        raise ValueError("JSON must be a list or {'recipes': [...]}")

    coll = get_collection()
    coll.create_index("recipe_id", unique=True)

    ops = []
    for r in recipes:
        rid = r.get("recipe_id")
        if not rid:
            continue
        ops.append(UpdateOne({"recipe_id": rid}, {"$set": r}, upsert=True))

    if ops:
        coll.bulk_write(ops)
    print(f"Upserted {len(ops)} recipes")


if __name__ == "__main__":
    main()
