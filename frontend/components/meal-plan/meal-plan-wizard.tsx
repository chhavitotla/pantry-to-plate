import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChefHat,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

import {
  ALLERGY_OPTIONS,
  DIETARY_OPTIONS,
  GOAL_OPTIONS,
  MEAL_OPTIONS,
  TOTAL_STEPS,
  type DietaryType,
  type GoalType,
  type MealType,
} from "@/components/meal-plan/constants";

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}

function TileButton({
  active,
  onClick,
  children,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[18px] border px-5 py-4 text-left transition-all duration-150 ${
        active
          ? "border-transparent bg-chefmate-ink text-white"
          : "border-chefmate-oat-deep bg-white text-chefmate-ink hover:border-chefmate-ink/30"
      }`}
    >
      <p className="font-semibold">{children}</p>
      {sub ? (
        <p className={`mt-0.5 text-xs ${active ? "text-white/70" : "text-chefmate-muted"}`}>{sub}</p>
      ) : null}
    </button>
  );
}

type MealPlanWizardProps = {
  step: number;
  chips: string[];
  pantryInput: string;
  pantryItems: string[];
  dietaryType: DietaryType | null;
  mealType: MealType | null;
  goal: GoalType | null;
  allergies: string[];
  loading: boolean;
  canAdvance: boolean;
  onPantryInputChange: (value: string) => void;
  onAddPantry: (raw: string) => void;
  onRemovePantry: (item: string) => void;
  onSetDietaryType: (value: DietaryType) => void;
  onSetMealType: (value: MealType) => void;
  onSetGoal: (value: GoalType) => void;
  onToggleAllergy: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function MealPlanWizard({
  step,
  chips,
  pantryInput,
  pantryItems,
  dietaryType,
  mealType,
  goal,
  allergies,
  loading,
  canAdvance,
  onPantryInputChange,
  onAddPantry,
  onRemovePantry,
  onSetDietaryType,
  onSetMealType,
  onSetGoal,
  onToggleAllergy,
  onBack,
  onNext,
}: MealPlanWizardProps) {
  return (
    <div className="min-h-screen bg-hero-glow">
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-14">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chefmate-sage">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div className="rounded-[14px] bg-chefmate-oat px-4 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-chefmate-muted">
              Progress
            </p>
            <p className="font-display text-xl font-bold text-chefmate-ink">
              {step}/{TOTAL_STEPS}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
            Guided meal plan flow
          </p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.03em] text-chefmate-ink sm:text-5xl">
            Let&apos;s plan your week,
            <br />
            one question at a time.
          </h1>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
            const n = index + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div
                key={n}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 ${
                  done
                    ? "bg-chefmate-terracotta text-white"
                    : active
                    ? "bg-chefmate-ink text-white"
                    : "border border-chefmate-oat-deep bg-white text-chefmate-muted"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
            );
          })}
        </div>

        {chips.length > 0 ? (
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
        ) : null}

        <div className="mt-6 rounded-[24px] border border-chefmate-oat-deep bg-white p-7 shadow-soft">
          <StepLabel>{step === 5 ? "Optional" : "Needed"}</StepLabel>

          {step === 1 ? (
            <div className="mt-3 space-y-5">
              <div>
                <h2 className="font-display text-3xl font-bold text-chefmate-ink">
                  First up, what are we working with?
                </h2>
                <p className="mt-2 text-sm text-chefmate-muted">
                  Drop in what&apos;s actually in the fridge, pantry, or that random kitchen shelf.
                </p>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={pantryInput}
                  onChange={(event) => onPantryInputChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      onAddPantry(pantryInput);
                    }
                  }}
                  placeholder="rice, egg, spinach..."
                  className="h-12 flex-1 rounded-2xl border border-chefmate-oat-deep bg-chefmate-oat px-4 text-sm text-chefmate-ink placeholder:text-chefmate-muted/60 focus:border-chefmate-terracotta/60 focus:outline-none focus:ring-2 focus:ring-chefmate-terracotta/20"
                />
                <button
                  type="button"
                  onClick={() => onAddPantry(pantryInput)}
                  className="rounded-2xl bg-chefmate-terracotta px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Drop it in
                </button>
              </div>
              {pantryItems.length === 0 ? (
                <p className="text-xs text-chefmate-muted">
                  Add at least one ingredient and we&apos;re in business.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pantryItems.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 rounded-2xl border border-chefmate-oat-deep bg-chefmate-oat px-4 py-2 text-sm font-medium text-chefmate-ink"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => onRemovePantry(item)}
                        className="text-chefmate-muted hover:text-chefmate-terracotta"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-3 space-y-5">
              <div>
                <h2 className="font-display text-3xl font-bold text-chefmate-ink">
                  Who are we cooking for?
                </h2>
                <p className="mt-2 text-sm text-chefmate-muted">
                  Pick the base food rule and ChefMate will keep results aligned.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {DIETARY_OPTIONS.map(({ value, label }) => (
                  <TileButton
                    key={value}
                    active={dietaryType === value}
                    onClick={() => onSetDietaryType(value)}
                  >
                    {label}
                  </TileButton>
                ))}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-3 space-y-5">
              <div>
                <h2 className="font-display text-3xl font-bold text-chefmate-ink">
                  What kind of meal are we planning?
                </h2>
                <p className="mt-2 text-sm text-chefmate-muted">
                  Choose the vibe so every day in the plan feels intentional.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {MEAL_OPTIONS.map(({ value, label }) => (
                  <TileButton
                    key={value}
                    active={mealType === value}
                    onClick={() => onSetMealType(value)}
                  >
                    {label}
                  </TileButton>
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="mt-3 space-y-5">
              <div>
                <h2 className="font-display text-3xl font-bold text-chefmate-ink">
                  What&apos;s the goal this week?
                </h2>
                <p className="mt-2 text-sm text-chefmate-muted">
                  ChefMate will prioritize recipes that lean into this.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {GOAL_OPTIONS.map(({ value, label, sub }) => (
                  <TileButton key={value} active={goal === value} onClick={() => onSetGoal(value)} sub={sub}>
                    {label}
                  </TileButton>
                ))}
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="mt-3 space-y-5">
              <div>
                <h2 className="font-display text-3xl font-bold text-chefmate-ink">
                  Anything to avoid?
                </h2>
                <p className="mt-2 text-sm text-chefmate-muted">
                  None to skip? Just hit Generate and we&apos;re off.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ALLERGY_OPTIONS.map((allergy) => (
                  <TileButton
                    key={allergy}
                    active={allergies.includes(allergy)}
                    onClick={() => onToggleAllergy(allergy)}
                  >
                    {allergy}
                  </TileButton>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={step === 1}
            className="flex items-center gap-2 rounded-full border border-chefmate-oat-deep bg-white px-5 py-3 text-sm font-medium text-chefmate-ink transition-colors hover:bg-chefmate-oat disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!canAdvance || loading}
            className="flex items-center gap-2 rounded-full bg-chefmate-terracotta px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building your plan...
              </>
            ) : step === TOTAL_STEPS ? (
              <>
                <CalendarDays className="h-4 w-4" />
                Generate my plan
              </>
            ) : (
              <>
                Next up
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

