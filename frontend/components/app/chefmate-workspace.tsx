"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AssistantResponsePanel } from "@/components/app/assistant-response-panel";
import { EmptyResultsPanel } from "@/components/app/empty-results-panel";
import { GuidedCookFlow } from "@/components/app/guided-cook-flow";
import { RecipeGrid } from "@/components/app/recipe-grid";
import { ResultsToolbar } from "@/components/app/results-toolbar";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRecommendRecipes } from "@/hooks/use-recommend-recipes";
import {
  loadRequestFromSession,
  loadResultsFromSession,
  saveRequestToSession,
  saveResultsToSession,
} from "@/lib/storage";
import { sanitizeRecommendPayload } from "@/lib/recommend-payload";
import type { RecommendPayload, RecommendResponse } from "@/types/api";

const defaultPayload: RecommendPayload = {
  pantry_items: [],
  dietary_type: "vegetarian",
  meal_type: "dinner",
  max_time_minutes: 30,
  nutrition_preferences: [],
  allergies: [],
};

export function ChefMateWorkspace() {
  const router = useRouter();
  const [payload, setPayload] = useState<RecommendPayload>(defaultPayload);
  const [results, setResults] = useState<RecommendResponse | null>(null);
  const recommendMutation = useRecommendRecipes();

  useEffect(() => {
    const storedRequest = loadRequestFromSession();
    const storedResults = loadResultsFromSession();

    if (storedRequest) {
      setPayload(sanitizeRecommendPayload(storedRequest));
    }

    if (storedResults) {
      setResults({
        recipes: storedResults.recipes,
        status: "OK",
        assistant_response: storedResults.assistantResponse,
        message: null,
      });
    }
  }, []);

  async function fetchRecommendations() {
    const sanitizedPayload = sanitizeRecommendPayload(payload);

    if (!sanitizedPayload.pantry_items.length) {
      toast.error("Add at least one ingredient to start.");
      return;
    }

    saveRequestToSession(sanitizedPayload);
    setPayload(sanitizedPayload);

    try {
      const response = await recommendMutation.mutateAsync(sanitizedPayload);

      if (response.status === "NO_MATCH" || response.recipes.length === 0) {
        router.push("/no-match");
        return;
      }

      saveResultsToSession({
        recipes: response.recipes,
        assistantResponse: response.assistant_response ?? null,
      });
      setResults(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ChefMate could not find recipes.");
    }
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <Card className="overflow-hidden border-chefmate-oat-deep/90 bg-gradient-to-r from-[#f6f1e7] via-[#fbf7ef] to-[#eef4ef]">
          <CardContent className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="sage" className="gap-2 px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Calm cooking companion
                </Badge>
                <Badge variant="outline" className="gap-2 px-3 py-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  Under 20-second setup
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-4xl font-extrabold tracking-[-0.05em] text-chefmate-ink sm:text-5xl">
                  A calmer way to ask, “What can I cook right now?”
                </h1>
                <p className="max-w-2xl text-base leading-7 text-chefmate-muted sm:text-lg">
                  No recipe rabbit hole. No fake productivity. Just a few quick prompts and a
                  dinner answer that feels picked, not random.
                </p>
              </div>
            </div>

            <Button asChild size="lg" variant="secondary">
              <Link href="/about">Why this exists</Link>
            </Button>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={80}>
        <GuidedCookFlow
          value={payload}
          onChange={(nextValue) => setPayload(sanitizeRecommendPayload(nextValue))}
          onSubmit={() => {
            void fetchRecommendations();
          }}
          isSubmitting={recommendMutation.isPending}
        />
      </Reveal>

      {recommendMutation.isPending ? <LoadingState /> : null}

      {recommendMutation.isError && !recommendMutation.isPending ? (
        <ErrorState
          message={
            recommendMutation.error instanceof Error
              ? recommendMutation.error.message
              : "ChefMate hit an unexpected snag."
          }
          onRetry={() => {
            void fetchRecommendations();
          }}
        />
      ) : null}

      {!recommendMutation.isPending && !results ? (
        <Reveal delay={140}>
          <Card className="border-chefmate-oat-deep/90 bg-white/82">
            <CardContent className="space-y-4 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-plum">
                Waiting for your vibe
              </p>
              <h2 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-chefmate-ink">
                Your next good dinner idea lands here.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-chefmate-muted">
                Run through the prompts above and ChefMate will turn your pantry into actual options
                without making the whole thing feel like homework.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      ) : null}

      {results?.status === "NO_MATCH" ? <EmptyResultsPanel /> : null}

      {results?.recipes.length ? (
        <div className="space-y-6">
          <ResultsToolbar count={results.recipes.length} payload={payload} />
          {results.assistant_response ? (
            <AssistantResponsePanel message={results.assistant_response} />
          ) : null}
          <RecipeGrid recipes={results.recipes} />
        </div>
      ) : null}
    </div>
  );
}
