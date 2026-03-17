"use client";

import { useMutation } from "@tanstack/react-query";

import { askRecipeFollowUp } from "@/lib/api";
import type { RecipeChatPayload } from "@/types/api";

export function useRecipeChat() {
  return useMutation({
    mutationKey: ["recipe-follow-up-chat"],
    mutationFn: (payload: RecipeChatPayload) => askRecipeFollowUp(payload),
  });
}
