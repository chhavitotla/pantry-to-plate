"use client";

import Link from "next/link";
import { Clock3, Drumstick, Leaf, Sparkles } from "lucide-react";

import { ShareRecipeButton } from "@/components/app/share-recipe-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinutes, titleCase } from "@/lib/formatters";
import type { Recipe } from "@/types/recipe";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const previewIngredients = recipe.ingredients.slice(0, 4);

  return (
    <div className="transition-transform duration-200 hover:-translate-y-1">
      <Card className="group h-full overflow-hidden border-chefmate-oat-deep/90 bg-white/90 shadow-soft transition-shadow duration-200 hover:shadow-lifted">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Badge variant="terracotta" className="gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              {titleCase(recipe.meal_type[0] ?? "Recipe")}
            </Badge>
            <Badge variant="sage" className="gap-2">
              <Clock3 className="h-3.5 w-3.5" />
              {formatMinutes(recipe.time.total_time_minutes)}
            </Badge>
          </div>
          <CardTitle className="text-3xl">{recipe.recipe_name}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {recipe.dietary_type.map((tag) => (
              <Badge key={tag} variant="outline" className="gap-2">
                <Leaf className="h-3.5 w-3.5" />
                {titleCase(tag)}
              </Badge>
            ))}
            {recipe.nutrition_profile.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="plum">
                {titleCase(tag)}
              </Badge>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-chefmate-muted">
              Ingredient preview
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {previewIngredients.map((ingredient) => (
                <div
                  key={`${ingredient.item}-${ingredient.quantity}`}
                  className="rounded-[22px] bg-chefmate-oat px-4 py-3"
                >
                  <p className="font-medium text-chefmate-ink">{ingredient.item}</p>
                  <p className="text-sm text-chefmate-muted">{ingredient.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-[24px] bg-[#eaf0fb] p-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-chefmate-muted">Calories</p>
              <p className="mt-1 text-lg font-semibold text-chefmate-ink">
                {recipe.macros_per_serving.calories_kcal ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-chefmate-muted">Protein</p>
              <p className="mt-1 text-lg font-semibold text-chefmate-ink">
                {recipe.macros_per_serving.protein_g ?? "-"}g
              </p>
            </div>
            <div>
              <p className="text-sm text-chefmate-muted">Carbs</p>
              <p className="mt-1 text-lg font-semibold text-chefmate-ink">
                {recipe.macros_per_serving.carbs_g ?? "-"}g
              </p>
            </div>
          </div>

          {recipe.allergens.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recipe.allergens.map((allergen) => (
                <Badge key={allergen} variant="saffron" className="gap-2">
                  <Drumstick className="h-3.5 w-3.5" />
                  Contains {titleCase(allergen)}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="mt-auto flex items-center gap-3">
          <Button asChild className="flex-1">
            <Link href={`/recipe/${recipe.recipe_id}`}>View Recipe</Link>
          </Button>
          <ShareRecipeButton recipe={recipe} />
        </CardFooter>
      </Card>
    </div>
  );
}
