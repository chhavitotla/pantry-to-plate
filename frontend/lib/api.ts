import {
  recipeChatPayloadSchema,
  recipeChatResponseSchema,
  recommendPayloadSchema,
  recommendResponseSchema,
  type RecipeChatPayload,
  type RecipeChatResponse,
  type RecommendPayload,
  type RecommendResponse,
} from "@/types/api";

export async function recommendRecipes(
  payload: RecommendPayload,
): Promise<RecommendResponse> {
  const body = recommendPayloadSchema.parse(payload);

  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  if (!response.ok) {
    const message =
      typeof json?.detail === "string"
        ? json.detail
        : "ChefMate could not reach the kitchen right now.";
    throw new Error(message);
  }

  return recommendResponseSchema.parse(json);
}

export async function askRecipeFollowUp(
  payload: RecipeChatPayload,
): Promise<RecipeChatResponse> {
  const body = recipeChatPayloadSchema.parse(payload);

  const response = await fetch("/api/recipe-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  if (!response.ok) {
    const message =
      typeof json?.detail === "string"
        ? json.detail
        : "ChefMate could not answer that recipe question right now.";
    throw new Error(message);
  }

  const parsed = recipeChatResponseSchema.parse(json);
  if (parsed.status !== "OK") {
    throw new Error(parsed.message ?? "ChefMate could not answer that recipe question.");
  }

  return parsed;
}
