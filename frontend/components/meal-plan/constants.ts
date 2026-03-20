import type { MealPlanPayload } from "@/types/api";

export type MealType = MealPlanPayload["meal_type"];
export type GoalType = MealPlanPayload["goal"];
export type DietaryType = MealPlanPayload["dietary_type"];

export const TOTAL_STEPS = 5;

export const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

export const GOAL_OPTIONS: { value: GoalType; label: string; sub: string }[] = [
  { value: "high_protein", label: "High Protein", sub: "Build & recover" },
  { value: "high_fiber", label: "High Fiber", sub: "Gut & energy" },
  { value: "balanced", label: "Balanced", sub: "All-round good" },
];

export const DIETARY_OPTIONS: { value: DietaryType; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
];

export const ALLERGY_OPTIONS = ["Dairy", "Gluten", "Eggs", "Nuts", "Soy", "Shellfish"];

export const DAY_COLORS = [
  "bg-[#fff8dc]",
  "bg-[#dff5ed]",
  "bg-[#fbd7e4]",
  "bg-[#e7dfff]",
  "bg-[#d9f0ff]",
];

