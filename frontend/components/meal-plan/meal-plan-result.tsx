import { StickyNote, Utensils } from "lucide-react";

import { DAY_COLORS } from "@/components/meal-plan/constants";
import { MealPlanFollowUpChat } from "@/components/meal-plan/meal-plan-follow-up-chat";
import type { DietaryType, GoalType, MealType } from "@/components/meal-plan/constants";
import type { MealPlanDay, MealPlanResponse } from "@/types/api";

type MealPlanResultProps = {
  result: MealPlanResponse;
  chips: string[];
  pantryItems: string[];
  mealType: MealType;
  goal: GoalType;
  dietaryType: DietaryType;
  allergies: string[];
  onReset: () => void;
  onApplyDays: (days: Record<string, MealPlanDay>, trace: string[]) => void;
};

export function MealPlanResult({
  result,
  chips,
  pantryItems,
  mealType,
  goal,
  dietaryType,
  allergies,
  onReset,
  onApplyDays,
}: MealPlanResultProps) {
  const dayEntries = Object.entries(result.days).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-hero-glow">
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-14">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
            Your meal plan is ready
          </p>
          <h1 className="font-display mt-2 text-5xl font-extrabold tracking-[-0.03em] text-chefmate-ink sm:text-6xl">
            Five days, sorted.
          </h1>
          <p className="mt-3 text-lg text-chefmate-muted">
            Built around what you have, tuned to how you eat.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-chefmate-oat-deep bg-white px-3 py-1 text-sm capitalize text-chefmate-muted"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {result.day_0_prep.length > 0 ? (
            <div className="overflow-hidden rounded-[28px] border border-chefmate-oat-deep bg-white shadow-soft">
              <div className="flex items-center gap-3 border-b border-chefmate-oat-deep bg-[#fdfaff] px-7 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff8dc]">
                  <StickyNote className="h-5 w-5 text-chefmate-plum" />
                </div>
                <div>
                  <p className="font-semibold text-chefmate-ink">Day 0 — Prep ahead</p>
                  <p className="text-sm text-chefmate-muted">Do these before your week starts</p>
                </div>
              </div>
              <div className="space-y-3 p-7">
                {result.day_0_prep.map((step, index) => (
                  <div
                    key={`${step}-${index}`}
                    className="flex gap-3 rounded-[22px] border border-chefmate-oat-deep/50 bg-white/75 px-4 py-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chefmate-terracotta text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-7 text-chefmate-ink">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-chefmate-terracotta" />
              <h2 className="font-display text-2xl font-bold text-chefmate-ink">Your 5-day plan</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dayEntries.map(([dayKey, dayData], index) => (
                <div
                  key={dayKey}
                  className={`overflow-hidden rounded-[24px] border border-white/80 shadow-soft ${
                    DAY_COLORS[index % DAY_COLORS.length]
                  }`}
                >
                  <div className="px-5 pb-3 pt-5">
                    <span className="font-display text-4xl font-extrabold text-chefmate-oat-deep">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1 text-base font-semibold leading-tight text-chefmate-ink">
                      {dayData.recipe}
                    </h3>
                  </div>
                  <div className="space-y-2 px-5 pb-5">
                    {dayData.steps.map((step, stepIndex) => (
                      <div
                        key={`${dayKey}-${stepIndex}`}
                        className="flex gap-2.5 rounded-[18px] bg-white/65 px-3.5 py-2.5"
                      >
                        <span className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-chefmate-ink shadow-sm">
                          {stepIndex + 1}
                        </span>
                        <p className="text-sm leading-6 text-chefmate-ink">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <MealPlanFollowUpChat
            days={result.days}
            pantryItems={pantryItems}
            mealType={mealType}
            goal={goal}
            dietaryType={dietaryType}
            allergies={allergies}
            onApplyDays={onApplyDays}
          />

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-chefmate-oat-deep bg-white px-6 py-3 text-sm font-medium text-chefmate-ink transition-colors hover:bg-chefmate-oat"
            >
              Plan another week
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
