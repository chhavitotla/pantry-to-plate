"use client";

import { useMutation } from "@tanstack/react-query";

import { askMealPlanFollowUp, createMealPlan } from "@/lib/api";
import type { MealPlanFollowUpPayload, MealPlanPayload } from "@/types/api";

export function useMealPlan() {
  return useMutation({
    mutationKey: ["meal-plan"],
    mutationFn: (payload: MealPlanPayload) => createMealPlan(payload),
  });
}

export function useMealPlanFollowUp() {
  return useMutation({
    mutationKey: ["meal-plan-follow-up"],
    mutationFn: (payload: MealPlanFollowUpPayload) => askMealPlanFollowUp(payload),
  });
}

