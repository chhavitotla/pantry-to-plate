"use client";

import { useState } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChefHat,
  Loader2,
  Sparkles,
  StickyNote,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";

// ─── Schema ───────────────────────────────────────────────────────────────────

const mealPlanResponseSchema = z.object({
  day_0_prep: z.array(z.string()).default([]),
  days: z.record(
    z.object({
      recipe: z.string(),
      steps: z.array(z.string()),
    })
  ),
  notes: z.array(z.string()).default([]),
  status: z.string(),
  message: z.string().nullable().optional(),
});

type MealPlanResponse = z.infer<typeof mealPlanResponseSchema>;
type MealType = "breakfast" | "lunch" | "dinner";
type GoalType = "high_protein" | "high_fiber" | "balanced";
type DietaryType = "vegetarian" | "vegan" | "non-vegetarian";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

const GOAL_OPTIONS: { value: GoalType; label: string; sub: string }[] = [
  { value: "high_protein", label: "High Protein", sub: "Build & recover" },
  { value: "high_fiber", label: "High Fiber", sub: "Gut & energy" },
  { value: "balanced", label: "Balanced", sub: "All-round good" },
];

const DIETARY_OPTIONS: { value: DietaryType; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
];

const ALLERGY_OPTIONS = ["Dairy", "Gluten", "Eggs", "Nuts", "Soy", "Shellfish"];

const DAY_COLORS = [
  "bg-[#fff8dc]",
  "bg-[#dff5ed]",
  "bg-[#fbd7e4]",
  "bg-[#e7dfff]",
  "bg-[#d9f0ff]",
];

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

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
      {sub && (
        <p className={`mt-0.5 text-xs ${active ? "text-white/70" : "text-chefmate-muted"}`}>
          {sub}
        </p>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MealPlanPage() {
  const [step, setStep] = useState(1);

  const [pantryInput, setPantryInput] = useState("");
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [dietaryType, setDietaryType] = useState<DietaryType | null>(null);
  const [allergies, setAllergies] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealPlanResponse | null>(null);

  // ── Pantry helpers ──
  function addPantry(raw: string) {
    const items = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setPantryItems((prev) => {
      const set = new Set(prev.map((p) => p.toLowerCase()));
      return [...prev, ...items.filter((i) => !set.has(i.toLowerCase()))];
    });
    setPantryInput("");
  }

  function removePantry(item: string) {
    setPantryItems((prev) => prev.filter((p) => p !== item));
  }

  function toggleAllergy(a: string) {
    setAllergies((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  // ── Navigation ──
  function canAdvance() {
    if (step === 1) return pantryItems.length > 0;
    if (step === 2) return dietaryType !== null;
    if (step === 3) return mealType !== null;
    if (step === 4) return goal !== null;
    return true; // step 5 allergies optional
  }

  function next() {
    if (!canAdvance()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      void submit();
    }
  }

  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  // ── Submit ──
  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/meal-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pantry_items: pantryItems,
            meal_type: mealType,
            goal,
            allergies: allergies.map((a) => a.toLowerCase()),
            dietary_type: dietaryType,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `Request failed (${res.status})`);
      }

      const raw = await res.json();
      const parsed = mealPlanResponseSchema.parse(raw);
      if (parsed.status !== "OK")
        throw new Error(parsed.message ?? "Something went wrong.");
      setResult(parsed);
      setStep(TOTAL_STEPS + 1);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "ChefMate couldn't generate a plan right now."
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Summary chips ──
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

  const dayEntries = result
    ? Object.entries(result.days).sort(([a], [b]) => a.localeCompare(b))
    : [];

  // ════════════════════════════════════════
  // RESULT SCREEN
  // ════════════════════════════════════════
  if (step === TOTAL_STEPS + 1 && result) {
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
            {/* Day 0 prep */}
            {result.day_0_prep.length > 0 && (
              <div className="overflow-hidden rounded-[28px] border border-chefmate-oat-deep bg-white shadow-soft">
                <div className="flex items-center gap-3 border-b border-chefmate-oat-deep bg-[#fdfaff] px-7 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff8dc]">
                    <StickyNote className="h-5 w-5 text-chefmate-plum" />
                  </div>
                  <div>
                    <p className="font-semibold text-chefmate-ink">Day 0 — Prep ahead</p>
                    <p className="text-sm text-chefmate-muted">
                      Do these before your week starts
                    </p>
                  </div>
                </div>
                <div className="space-y-3 p-7">
                  {result.day_0_prep.map((s, i) => (
                    <div
                      key={i}
                      className="flex gap-3 rounded-[22px] border border-chefmate-oat-deep/50 bg-white/75 px-4 py-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chefmate-terracotta text-xs font-semibold text-white">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-7 text-chefmate-ink">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day cards */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-chefmate-terracotta" />
                <h2 className="font-display text-2xl font-bold text-chefmate-ink">
                  Your 5-day plan
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dayEntries.map(([dayKey, dayData], i) => (
                  <div
                    key={dayKey}
                    className={`overflow-hidden rounded-[24px] border border-white/80 shadow-soft ${
                      DAY_COLORS[i % DAY_COLORS.length]
                    }`}
                  >
                    <div className="px-5 pb-3 pt-5">
                      <span className="font-display text-4xl font-extrabold text-chefmate-oat-deep">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1 text-base font-semibold leading-tight text-chefmate-ink">
                        {dayData.recipe}
                      </h3>
                    </div>
                    <div className="space-y-2 px-5 pb-5">
                      {dayData.steps.map((s, si) => (
                        <div
                          key={si}
                          className="flex gap-2.5 rounded-[18px] bg-white/65 px-3.5 py-2.5"
                        >
                          <span className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-chefmate-ink shadow-sm">
                            {si + 1}
                          </span>
                          <p className="text-sm leading-6 text-chefmate-ink">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {result.notes.length > 0 && (
              <div className="overflow-hidden rounded-[28px] border border-chefmate-oat-deep bg-white shadow-soft">
                <div className="flex items-center gap-3 border-b border-chefmate-oat-deep bg-[#fdfaff] px-7 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dff5ed]">
                    <Sparkles className="h-5 w-5 text-chefmate-sage" />
                  </div>
                  <div>
                    <p className="font-semibold text-chefmate-ink">Nutrition notes</p>
                    <p className="text-sm text-chefmate-muted">Quick stats on your week</p>
                  </div>
                </div>
                <div className="grid gap-3 p-7 sm:grid-cols-2">
                  {result.notes.map((note, i) => (
                    <div
                      key={i}
                      className="flex gap-3 rounded-[22px] bg-chefmate-oat px-4 py-3"
                    >
                      <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-chefmate-sage" />
                      <p className="text-sm leading-7 text-chefmate-ink">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setResult(null);
                  setPantryItems([]);
                  setMealType(null);
                  setGoal(null);
                  setDietaryType(null);
                  setAllergies([]);
                }}
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

  // ════════════════════════════════════════
  // WIZARD SCREEN
  // ════════════════════════════════════════
  return (
    <div className="min-h-screen bg-hero-glow">
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-14">
        {/* Top row: icon + progress pill */}
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

        {/* Label + headline */}
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

        {/* Step dots */}
        <div className="mt-6 flex items-center gap-3">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            const n = i + 1;
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

        {/* Summary chips */}
        {chips.length > 0 && (
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
        )}

        {/* Question card */}
        <div className="mt-6 rounded-[24px] border border-chefmate-oat-deep bg-white p-7 shadow-soft">
          <StepLabel>Needed</StepLabel>

          {/* Step 1 — Pantry */}
          {step === 1 && (
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
                  onChange={(e) => setPantryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addPantry(pantryInput);
                    }
                  }}
                  placeholder="rice, egg, spinach…"
                  className="h-12 flex-1 rounded-2xl border border-chefmate-oat-deep bg-chefmate-oat px-4 text-sm text-chefmate-ink placeholder:text-chefmate-muted/60 focus:border-chefmate-terracotta/60 focus:outline-none focus:ring-2 focus:ring-chefmate-terracotta/20"
                />
                <button
                  type="button"
                  onClick={() => addPantry(pantryInput)}
                  className="rounded-2xl bg-chefmate-terracotta px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Drop it in
                </button>
              </div>
              {pantryItems.length === 0 && (
                <p className="text-xs text-chefmate-muted">
                  Add at least one ingredient and we&apos;re in business.
                </p>
              )}
              {pantryItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pantryItems.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 rounded-2xl border border-chefmate-oat-deep bg-chefmate-oat px-4 py-2 text-sm font-medium text-chefmate-ink"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removePantry(item)}
                        className="text-chefmate-muted hover:text-chefmate-terracotta"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Dietary type */}
          {step === 2 && (
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
                    onClick={() => setDietaryType(value)}
                  >
                    {label}
                  </TileButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Meal type */}
          {step === 3 && (
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
                    onClick={() => setMealType(value)}
                  >
                    {label}
                  </TileButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Goal */}
          {step === 4 && (
            <div className="mt-3 space-y-5">
              <div>
                <h2 className="font-display text-3xl font-bold text-chefmate-ink">
                  What&apos;s the goal this week?
                </h2>
                <p className="mt-2 text-sm text-chefmate-muted">
                  ChefMate will prioritise recipes that lean into this.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {GOAL_OPTIONS.map(({ value, label, sub }) => (
                  <TileButton
                    key={value}
                    active={goal === value}
                    onClick={() => setGoal(value)}
                    sub={sub}
                  >
                    {label}
                  </TileButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 — Allergies */}
          {step === 5 && (
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
                {ALLERGY_OPTIONS.map((a) => (
                  <TileButton
                    key={a}
                    active={allergies.includes(a)}
                    onClick={() => toggleAllergy(a)}
                  >
                    {a}
                  </TileButton>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back / Next */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="flex items-center gap-2 rounded-full border border-chefmate-oat-deep bg-white px-5 py-3 text-sm font-medium text-chefmate-ink transition-colors hover:bg-chefmate-oat disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={next}
            disabled={!canAdvance() || loading}
            className="flex items-center gap-2 rounded-full bg-chefmate-terracotta px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building your plan…
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