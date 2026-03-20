"use client";

import { Loader2, MessageCircleMore, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useMealPlanFollowUp } from "@/hooks/use-meal-plan";
import type { DietaryType, GoalType, MealType } from "@/components/meal-plan/constants";
import type { MealPlanDay } from "@/types/api";

type MealPlanFollowUpChatProps = {
  days: Record<string, MealPlanDay>;
  pantryItems: string[];
  mealType: MealType;
  goal: GoalType;
  dietaryType: DietaryType;
  allergies: string[];
  onApplyDays: (days: Record<string, MealPlanDay>, trace: string[]) => void;
};

const suggestedQuestions = [
  "Swap day 3",
  "Change day 5 to something lighter",
  "Make day 2 higher protein",
  "Replace one dish with a quicker option",
];

export function MealPlanFollowUpChat({
  days,
  pantryItems,
  mealType,
  goal,
  dietaryType,
  allergies,
  onApplyDays,
}: MealPlanFollowUpChatProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const followUpMutation = useMealPlanFollowUp();

  async function askFollowUp(customQuestion?: string) {
    const nextQuestion = (customQuestion ?? question).trim();
    if (!nextQuestion) {
      return;
    }

    try {
      const response = await followUpMutation.mutateAsync({
        question: nextQuestion,
        days,
        pantry_items: pantryItems,
        meal_type: mealType,
        goal,
        dietary_type: dietaryType,
        allergies: allergies.map((item) => item.toLowerCase()),
      });
      onApplyDays(response.days, response.trace);
      setAnswer(response.answer);
      setQuestion(customQuestion ? "" : question);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "ChefMate could not update that day right now.",
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-chefmate-oat-deep bg-white shadow-soft">
      <div className="flex items-center gap-3 border-b border-chefmate-oat-deep bg-[#fdfaff] px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eaf0fb]">
          <MessageCircleMore className="h-5 w-5 text-chefmate-plum" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-terracotta">
            Plan follow-up
          </p>
          <h3 className="font-display text-2xl font-bold text-chefmate-ink sm:text-3xl">
            Need a swap for a specific day?
          </h3>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <p className="text-sm leading-7 text-chefmate-muted">
          Ask ChefMate to replace or tune a specific day. Example: “Swap day 3” or “change day 5
          to a higher-fiber meal.”
        </p>

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                void askFollowUp(item);
              }}
              disabled={followUpMutation.isPending}
              className="rounded-full border border-chefmate-oat-deep bg-chefmate-oat px-3 py-1.5 text-sm text-chefmate-ink transition-colors hover:bg-white disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void askFollowUp();
              }
            }}
            placeholder="Swap day 2 with a quicker dinner..."
            className="h-12 flex-1 rounded-2xl border border-chefmate-oat-deep bg-chefmate-oat px-4 text-sm text-chefmate-ink placeholder:text-chefmate-muted/60 focus:border-chefmate-terracotta/60 focus:outline-none focus:ring-2 focus:ring-chefmate-terracotta/20"
          />
          <button
            type="button"
            onClick={() => {
              void askFollowUp();
            }}
            disabled={followUpMutation.isPending}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-chefmate-terracotta px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:min-w-[170px]"
          >
            {followUpMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
            Ask
          </button>
        </div>

        {answer ? (
          <div className="rounded-[22px] border border-chefmate-oat-deep bg-chefmate-oat px-4 py-3">
            <p className="text-sm leading-7 text-chefmate-ink">{answer}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

