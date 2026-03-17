export type RecipeIngredient = {
  item: string;
  quantity: string;
};

export type RecipeTime = {
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
};

export type RecipeMacros = {
  calories_kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fibre_g?: number;
};

export type RecipeServing = {
  serving_size?: string;
  servings_count?: number;
  scalable?: boolean;
  serving_scaling_tags?: string[];
};

export type Recipe = {
  recipe_id: string;
  recipe_name: string;
  allergens: string[];
  dietary_type: string[];
  ingredients: RecipeIngredient[];
  macros_per_serving: RecipeMacros;
  meal_type: string[];
  nutrition_profile: string[];
  serving: RecipeServing;
  steps: string[];
  time: RecipeTime;
  time_effort_tags: string[];
};
