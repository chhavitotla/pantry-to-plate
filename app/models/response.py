from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class IngredientResponse(BaseModel):
    item: str
    quantity: str


class RecipeResponse(BaseModel):
    recipe_id: str
    recipe_name: str
    allergens: List[str] = Field(default_factory=list)
    dietary_type: List[str] = Field(default_factory=list)
    ingredients: List[IngredientResponse] = Field(default_factory=list)
    macros_per_serving: Dict[str, Any] = Field(default_factory=dict)
    meal_type: List[str] = Field(default_factory=list)
    nutrition_profile: List[str] = Field(default_factory=list)
    serving: Dict[str, Any] = Field(default_factory=dict)
    steps: List[str] = Field(default_factory=list)
    time: Dict[str, Any] = Field(default_factory=dict)
    time_effort_tags: List[str] = Field(default_factory=list)


class RecommendResponse(BaseModel):
    recipes: List[RecipeResponse]
    status: str
    message: Optional[str] = None
    assistant_response: Optional[str] = None


class RecipeChatResponse(BaseModel):
    answer: str
    status: str
    message: Optional[str] = None


class DayPlanResponse(BaseModel):
    recipe: str
    steps:  List[str]
    recipe_id: Optional[str] = None


class MealPlanResponse(BaseModel):
    day_0_prep: List[str]
    days:       Dict[str, DayPlanResponse]
    notes:      List[str]
    trace:      List[str] = Field(default_factory=list)
    nutrition_scores: Dict[str, Any] = Field(default_factory=dict)
    status:     str
    message:    Optional[str] = None


class MealPlanFollowUpResponse(BaseModel):
    answer: str
    days: Dict[str, DayPlanResponse]
    trace: List[str] = Field(default_factory=list)
    status: str
    message: Optional[str] = None
