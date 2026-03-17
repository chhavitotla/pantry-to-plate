"use client";

import { ArrowLeft, ArrowRight, Check, ChefHat, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  allergyOptions,
  dietaryOptions,
  maxTimeOptions,
  mealTypeOptions,
  nutritionPreferenceOptions,
} from "@/lib/constants";
import type { RecommendPayload } from "@/types/api";
import { titleCase } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const suggestedIngredients = [
  "egg",
  "rice",
  "tomato",
  "garlic",
  "spinach",
  "paneer",
  "onion",
  "yogurt",
];

type StepDefinition = {
  id: string;
  title: string;
  prompt: string;
  optional?: boolean;
};

const steps: StepDefinition[] = [
  {
    id: "pantry_items",
    title: "First up, what are we working with tonight?",
    prompt: "Drop in what is actually in the fridge, pantry, or that random kitchen shelf.",
  },
  {
    id: "dietary_type",
    title: "Who are we cooking for?",
    prompt: "Pick the base food rule and ChefMate will keep the results aligned.",
  },
  {
    id: "meal_type",
    title: "What kind of meal sounds right?",
    prompt: "Choose the vibe so the results feel like tonight, not any random day.",
  },
  {
    id: "max_time_minutes",
    title: "How long are we realistically cooking?",
    prompt: "Be honest. We want the answer to match your energy level.",
  },
  {
    id: "nutrition_preferences",
    title: "Any bonus preferences?",
    prompt:
      "Optional. Pick the exact nutrition or cooking-style tags you care about, while time stays in the dedicated cooking-time step.",
    optional: true,
  },
  {
    id: "allergies",
    title: "Anything we should dodge?",
    prompt: "Optional, but we’ll send these straight to the backend as hard avoids.",
    optional: true,
  },
] as const;

function StepBubble({
  active,
  completed,
  children,
}: {
  active: boolean;
  completed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all",
        active ? "bg-chefmate-sage text-white shadow-soft" : "",
        completed ? "bg-chefmate-terracotta text-white" : "",
        !active && !completed ? "bg-white text-chefmate-muted border border-chefmate-oat-deep" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function ChoicePill({
  label,
  active,
  tone,
  onClick,
}: {
  label: string;
  active: boolean;
  tone: "lavender" | "pink" | "mint" | "yellow";
  onClick: () => void;
}) {
  const tones = {
    lavender: active ? "bg-chefmate-sage text-white border-chefmate-sage" : "bg-white text-chefmate-ink border-chefmate-oat-deep",
    pink: active ? "bg-chefmate-terracotta text-white border-chefmate-terracotta" : "bg-[#f7efe8] text-chefmate-ink border-[#ead7c7]",
    mint: active ? "bg-chefmate-sage text-white border-chefmate-sage" : "bg-[#edf3ee] text-chefmate-ink border-[#d9e5dc]",
    yellow: active ? "bg-chefmate-plum text-white border-chefmate-plum" : "bg-[#f5efe3] text-chefmate-ink border-chefmate-oat-deep",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border px-5 py-4 text-left text-base font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

function MultiChoicePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
        active
          ? "bg-chefmate-sage text-white shadow-soft"
          : "border border-chefmate-oat-deep bg-white text-chefmate-ink shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}

export function GuidedCookFlow({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  value: RecommendPayload;
  onChange: (value: RecommendPayload) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draftIngredient, setDraftIngredient] = useState("");
  const currentStep = steps[stepIndex];

  function addIngredient(raw: string) {
    const ingredient = raw.trim().toLowerCase();
    if (!ingredient || value.pantry_items.includes(ingredient)) {
      return;
    }

    onChange({
      ...value,
      pantry_items: [...value.pantry_items, ingredient],
    });
    setDraftIngredient("");
  }

  function removeIngredient(target: string) {
    onChange({
      ...value,
      pantry_items: value.pantry_items.filter((item) => item !== target),
    });
  }

  function toggleListValue(field: "nutrition_preferences" | "allergies", item: string) {
    const current = value[field];
    onChange({
      ...value,
      [field]: current.includes(item)
        ? current.filter((entry) => entry !== item)
        : [...current, item],
    });
  }

  function canProceed() {
    switch (currentStep.id) {
      case "pantry_items":
        return value.pantry_items.length > 0;
      case "dietary_type":
        return Boolean(value.dietary_type);
      case "meal_type":
        return Boolean(value.meal_type);
      case "max_time_minutes":
        return Boolean(value.max_time_minutes);
      default:
        return true;
    }
  }

  function nextStep() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }

    onSubmit();
  }

  const summary = [
    value.pantry_items.length ? `${value.pantry_items.length} ingredients` : null,
    value.dietary_type ? titleCase(value.dietary_type) : null,
    value.meal_type ? titleCase(value.meal_type) : null,
    value.max_time_minutes ? `${value.max_time_minutes} min` : null,
  ].filter(Boolean);

  return (
    <Card className="overflow-hidden border-chefmate-oat-deep/90 bg-white">
      <CardContent className="space-y-8 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chefmate-sage text-white shadow-soft">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
                Guided cooking flow
              </p>
              <h1 className="mt-2 font-display text-5xl font-bold tracking-[-0.04em] text-chefmate-ink">
                Let&apos;s make dinner feel way less annoying.
              </h1>
            </div>
          </div>
          <div className="hidden rounded-[24px] bg-[#f6f1e7] px-4 py-3 text-right sm:block">
            <p className="text-xs uppercase tracking-[0.16em] text-chefmate-muted">Progress</p>
            <p className="mt-1 text-xl font-semibold text-chefmate-ink">
              {stepIndex + 1}/{steps.length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {steps.map((step, index) => (
            <StepBubble key={step.id} active={index === stepIndex} completed={index < stepIndex}>
              {index < stepIndex ? <Check className="h-4 w-4" /> : index + 1}
            </StepBubble>
          ))}
        </div>

        {summary.length ? (
          <div className="flex flex-wrap gap-2">
            {summary.map((item) => (
              <Badge key={item} variant="outline" className="rounded-full bg-white px-3 py-2">
                {item}
              </Badge>
            ))}
          </div>
        ) : null}

        <div
          key={currentStep.id}
          className="animate-fade-up space-y-6 rounded-[30px] border border-chefmate-oat-deep/80 bg-gradient-to-br from-white to-[#fbf8f3] p-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-chefmate-sage" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-sage">
                {currentStep.optional ? "Optional" : "Needed"}
              </p>
            </div>
            <h2 className="font-display text-4xl font-bold tracking-[-0.04em] text-chefmate-ink">
              {currentStep.title}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-chefmate-muted">
              {currentStep.prompt}
            </p>
          </div>

          {currentStep.id === "pantry_items" ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={draftIngredient}
                  onChange={(event) => setDraftIngredient(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addIngredient(draftIngredient);
                    }
                  }}
                  placeholder="rice, egg, spinach..."
                  className="h-14 flex-1 rounded-[22px] text-base"
                />
                <Button
                  type="button"
                  size="lg"
                  className="min-w-[170px]"
                  onClick={() => addIngredient(draftIngredient)}
                >
                  Drop it in
                </Button>
              </div>

              <div className="flex min-h-12 flex-wrap gap-2">
                {value.pantry_items.length ? (
                  value.pantry_items.map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="gap-2 rounded-full bg-white px-4 py-2 text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        aria-label={`Remove ${item}`}
                        onClick={() => removeIngredient(item)}
                        className="text-chefmate-muted hover:text-chefmate-terracotta"
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-chefmate-muted">
                    Add at least one ingredient and we&apos;re in business.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {suggestedIngredients
                  .filter((item) => !value.pantry_items.includes(item))
                  .slice(0, 6)
                  .map((item, index) => (
                    <ChoicePill
                      key={item}
                      label={item}
                      active={false}
                      tone={(["lavender", "pink", "mint", "yellow"] as const)[index % 4]}
                      onClick={() => addIngredient(item)}
                    />
                  ))}
              </div>
            </div>
          ) : null}

          {currentStep.id === "dietary_type" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {dietaryOptions.map((option, index) => (
                <ChoicePill
                  key={option.value}
                  label={option.label}
                  active={value.dietary_type === option.value}
                  tone={(["lavender", "pink", "mint"] as const)[index]}
                  onClick={() => onChange({ ...value, dietary_type: option.value })}
                />
              ))}
            </div>
          ) : null}

          {currentStep.id === "meal_type" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {mealTypeOptions.map((option, index) => (
                <ChoicePill
                  key={option.value}
                  label={option.label}
                  active={value.meal_type === option.value}
                  tone={(["lavender", "pink", "mint", "yellow"] as const)[index % 4]}
                  onClick={() => onChange({ ...value, meal_type: option.value })}
                />
              ))}
            </div>
          ) : null}

          {currentStep.id === "max_time_minutes" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {maxTimeOptions.map((option, index) => (
                <ChoicePill
                  key={option.value}
                  label={option.label}
                  active={value.max_time_minutes === option.value}
                  tone={(["lavender", "pink", "mint", "yellow"] as const)[index % 4]}
                  onClick={() => onChange({ ...value, max_time_minutes: option.value })}
                />
              ))}
            </div>
          ) : null}

          {currentStep.id === "nutrition_preferences" ? (
            <div className="space-y-5">
              {nutritionPreferenceOptions.map((section) => (
                <div key={section.title} className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-chefmate-muted">
                    {section.title}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {section.options.map((option) => (
                      <MultiChoicePill
                        key={option.value}
                        label={option.label}
                        active={value.nutrition_preferences.includes(option.value)}
                        onClick={() => toggleListValue("nutrition_preferences", option.value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {currentStep.id === "allergies" ? (
            <div className="flex flex-wrap gap-3">
              {allergyOptions.map((option) => (
                <MultiChoicePill
                  key={option.value}
                  label={option.label}
                  active={value.allergies.includes(option.value)}
                  onClick={() => toggleListValue("allergies", option.value)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row">
              {currentStep.optional ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                onClick={nextStep}
                disabled={isSubmitting}
                >
                  Skip for now
                </Button>
              ) : null}
            <Button
              type="button"
              size="lg"
              onClick={nextStep}
              disabled={!canProceed() || isSubmitting}
              className="min-w-[180px]"
            >
              {stepIndex === steps.length - 1
                ? isSubmitting
                  ? "Finding your meal..."
                  : "Find my meal"
                : "Next up"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
