"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  TOTAL_STEPS,
  type DietaryType,
  type GoalType,
  type MealType,
} from "@/components/meal-plan/constants";
import { MealPlanResult } from "@/components/meal-plan/meal-plan-result";
import { MealPlanWizard } from "@/components/meal-plan/meal-plan-wizard";
import { useMealPlan } from "@/hooks/use-meal-plan";
import type { MealPlanDay, MealPlanResponse } from "@/types/api";

export default function MealPlanPage() {
  const [step, setStep] = useState(1);

  const [pantryInput, setPantryInput] = useState("");
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [dietaryType, setDietaryType] = useState<DietaryType | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);

  const [result, setResult] = useState<MealPlanResponse | null>(null);
  const mealPlanMutation = useMealPlan();

  function addPantry(raw: string) {
    const items = raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setPantryItems((prev) => {
      const seen = new Set(prev.map((item) => item.toLowerCase()));
      return [...prev, ...items.filter((item) => !seen.has(item.toLowerCase()))];
    });
    setPantryInput("");
  }

  function removePantry(item: string) {
    setPantryItems((prev) => prev.filter((entry) => entry !== item));
  }

  function toggleAllergy(allergy: string) {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((entry) => entry !== allergy) : [...prev, allergy],
    );
  }

  function canAdvance(currentStep: number) {
    if (currentStep === 1) return pantryItems.length > 0;
    if (currentStep === 2) return dietaryType !== null;
    if (currentStep === 3) return mealType !== null;
    if (currentStep === 4) return goal !== null;
    return true;
  }

  async function submit() {
    if (!mealType || !goal || !dietaryType) {
      toast.error("Please complete all required steps first.");
      return;
    }

    try {
      const response = await mealPlanMutation.mutateAsync({
        pantry_items: pantryItems,
        meal_type: mealType,
        goal,
        dietary_type: dietaryType,
        allergies: allergies.map((allergy) => allergy.toLowerCase()),
      });

      setResult(response);
      setStep(TOTAL_STEPS + 1);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "ChefMate couldn't generate a plan right now.",
      );
    }
  }

  function next() {
    if (!canAdvance(step)) {
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((value) => value + 1);
      return;
    }

    void submit();
  }

  function back() {
    if (step > 1) {
      setStep((value) => value - 1);
    }
  }

  const chips = [
    pantryItems.length > 0
      ? `${pantryItems.length} ingredient${pantryItems.length > 1 ? "s" : ""}`
      : null,
    dietaryType ?? null,
    mealType ?? null,
    goal ? goal.replace(/_/g, " ") : null,
    allergies.length > 0
      ? `${allergies.length} allerg${allergies.length > 1 ? "ies" : "y"}`
      : null,
  ].filter(Boolean) as string[];

  if (result && step === TOTAL_STEPS + 1 && mealType && goal && dietaryType) {
    return (
      <MealPlanResult
        result={result}
        chips={chips}
        pantryItems={pantryItems}
        mealType={mealType}
        goal={goal}
        dietaryType={dietaryType}
        allergies={allergies}
        onApplyDays={(days: Record<string, MealPlanDay>, trace: string[]) => {
          setResult((current) => {
            if (!current) {
              return current;
            }
            return {
              ...current,
              days,
              trace: trace.length > 0 ? [...current.trace, ...trace] : current.trace,
            };
          });
        }}
        onReset={() => {
          setStep(1);
          setResult(null);
          setPantryInput("");
          setPantryItems([]);
          setMealType(null);
          setGoal(null);
          setDietaryType(null);
          setAllergies([]);
        }}
      />
    );
  }

  return (
    <MealPlanWizard
      step={step}
      chips={chips}
      pantryInput={pantryInput}
      pantryItems={pantryItems}
      dietaryType={dietaryType}
      mealType={mealType}
      goal={goal}
      allergies={allergies}
      loading={mealPlanMutation.isPending}
      canAdvance={canAdvance(step)}
      onPantryInputChange={setPantryInput}
      onAddPantry={addPantry}
      onRemovePantry={removePantry}
      onSetDietaryType={setDietaryType}
      onSetMealType={setMealType}
      onSetGoal={setGoal}
      onToggleAllergy={toggleAllergy}
      onBack={back}
      onNext={next}
    />
  );
}

