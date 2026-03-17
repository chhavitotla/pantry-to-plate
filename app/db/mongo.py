from pymongo import MongoClient
import certifi
from app.core.config import settings

_client = None
_collection = None


def get_collection():
    global _client, _collection
    if _collection is None:
        _client = MongoClient(
            settings.mongo_uri,
            tlsCAFile=certifi.where(),
        )
        _db = _client[settings.mongo_db]
        _collection = _db[settings.mongo_collection]
    return _collection
