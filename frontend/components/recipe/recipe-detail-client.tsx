"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { RecipeFollowUpChat } from "@/components/recipe/recipe-follow-up-chat";
import { RecipeDetailCard } from "@/components/recipe/recipe-detail-card";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { loadResultsFromSession } from "@/lib/storage";
import type { Recipe } from "@/types/recipe";

export function RecipeDetailClient({ recipeId }: { recipeId: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    const results = loadResultsFromSession();
    setRecipe(results?.recipes.find((entry) => entry.recipe_id === recipeId) ?? null);
    setCheckedSession(true);
  }, [recipeId]);

  if (checkedSession && !recipe) {
    return (
      <div className="space-y-6">
        <Button asChild variant="secondary">
          <Link href="/app">
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Link>
        </Button>
        <ErrorState message="We could not find that recipe in the current session. Head back and run a fresh search." />
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="secondary">
        <Link href="/app">
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </Link>
      </Button>
      <RecipeDetailCard recipe={recipe} />
      <RecipeFollowUpChat recipe={recipe} />
    </div>
  );
}
