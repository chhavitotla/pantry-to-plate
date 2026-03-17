import { z } from "zod";

import type { Recipe } from "@/types/recipe";

export const ingredientSchema = z.object({
  item: z.string(),
  quantity: z.string(),
});

export const recipeSchema = z.object({
  recipe_id: z.string(),
  recipe_name: z.string(),
  allergens: z.array(z.string()).default([]),
  dietary_type: z.array(z.string()).default([]),
  ingredients: z.array(ingredientSchema).default([]),
  macros_per_serving: z
    .object({
      calories_kcal: z.number().optional(),
      protein_g: z.number().optional(),
      carbs_g: z.number().optional(),
      fibre_g: z.number().optional(),
    })
    .catch({}),
  meal_type: z.array(z.string()).default([]),
  nutrition_profile: z.array(z.string()).default([]),
  serving: z
    .object({
      serving_size: z.string().optional(),
      servings_count: z.number().optional(),
      scalable: z.boolean().optional(),
      serving_scaling_tags: z.array(z.string()).optional(),
    })
    .catch({}),
  steps: z.array(z.string()).default([]),
  time: z
    .object({
      prep_time_minutes: z.number().optional(),
      cook_time_minutes: z.number().optional(),
      total_time_minutes: z.number().optional(),
    })
    .catch({}),
  time_effort_tags: z.array(z.string()).default([]),
});

export const recommendPayloadSchema = z.object({
  pantry_items: z.array(z.string()).min(1),
  dietary_type: z.string().min(1),
  meal_type: z.string().min(1),
  max_time_minutes: z.number().int().positive(),
  nutrition_preferences: z.array(z.string()),
  allergies: z.array(z.string()),
});

export const recommendResponseSchema = z.object({
  recipes: z.array(recipeSchema).default([]),
  status: z.string(),
  message: z.string().nullable().optional(),
  assistant_response: z.string().nullable().optional(),
});

export const recipeChatPayloadSchema = z.object({
  recipe_id: z.string().min(1),
  question: z.string().min(1),
});

export const recipeChatResponseSchema = z.object({
  answer: z.string(),
  status: z.string(),
  message: z.string().nullable().optional(),
});

export type RecommendPayload = z.infer<typeof recommendPayloadSchema>;
export type RecommendResponse = z.infer<typeof recommendResponseSchema>;
export type RecipeChatPayload = z.infer<typeof recipeChatPayloadSchema>;
export type RecipeChatResponse = z.infer<typeof recipeChatResponseSchema>;
export type { Recipe };
