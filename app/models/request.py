from typing import List
from pydantic import BaseModel

class RecommendRequest(BaseModel):
    pantry_items: List[str]
    dietary_type: str
    meal_type: str
    max_time_minutes: int
    nutrition_preferences: List[str]
    allergies: List[str]


class RecipeChatRequest(BaseModel):
    recipe_id: str
    question: str
