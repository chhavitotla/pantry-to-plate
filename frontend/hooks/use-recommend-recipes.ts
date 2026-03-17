"use client";

import { useMutation } from "@tanstack/react-query";

import { recommendRecipes } from "@/lib/api";
import type { RecommendPayload } from "@/types/api";

export function useRecommendRecipes() {
  return useMutation({
    mutationKey: ["recommend-recipes"],
    mutationFn: (payload: RecommendPayload) => recommendRecipes(payload),
  });
}
