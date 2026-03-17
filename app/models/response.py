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
