import type { RecommendPayload } from "@/types/api";

const duplicateTimePreferenceTags = new Set(["under_30_minutes", "under_45_minutes"]);

export function sanitizeRecommendPayload(payload: RecommendPayload): RecommendPayload {
  return {
    ...payload,
    nutrition_preferences: payload.nutrition_preferences.filter(
      (tag) => !duplicateTimePreferenceTags.has(tag),
    ),
  };
}
