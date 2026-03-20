from typing import List, Literal
from pydantic import BaseModel, Field


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


class MealPlanRequest(BaseModel):
    pantry_items:  List[str]
    meal_type:     Literal["breakfast", "lunch", "dinner"]
    goal:          Literal["high_protein", "high_fiber", "balanced"]
    allergies:     List[str] = Field(default_factory=list)
    dietary_type:  Literal["vegetarian", "vegan", "non-vegetarian"]


class MealPlanDayPayload(BaseModel):
    recipe: str
    steps: List[str] = Field(default_factory=list)
    recipe_id: str | None = None


class MealPlanFollowUpRequest(BaseModel):
    question: str
    days: dict[str, MealPlanDayPayload]
    pantry_items: List[str]
    meal_type: Literal["breakfast", "lunch", "dinner"]
    goal: Literal["high_protein", "high_fiber", "balanced"]
    allergies: List[str] = Field(default_factory=list)
    dietary_type: Literal["vegetarian", "vegan", "non-vegetarian"]
