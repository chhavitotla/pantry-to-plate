import { Clock3, CookingPot, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMinutes, titleCase } from "@/lib/formatters";
import type { Recipe } from "@/types/recipe";

export function RecipeDetailCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card className="overflow-hidden bg-white/88">
      <CardHeader className="space-y-5 border-b border-chefmate-oat-deep/70 bg-[#fdfaff]">
        <div className="flex flex-wrap gap-2">
          {recipe.meal_type.map((tag) => (
            <Badge key={tag} variant="terracotta">
              {titleCase(tag)}
            </Badge>
          ))}
          {recipe.nutrition_profile.map((tag) => (
            <Badge key={tag} variant="sage">
              {titleCase(tag)}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-4xl sm:text-5xl">{recipe.recipe_name}</CardTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] bg-chefmate-oat p-4">
            <div className="flex items-center gap-2 text-chefmate-muted">
              <Clock3 className="h-4 w-4" />
              <span className="text-sm">Total time</span>
            </div>
            <p className="mt-3 text-xl font-semibold text-chefmate-ink">
              {formatMinutes(recipe.time.total_time_minutes)}
            </p>
          </div>
          <div className="rounded-[24px] bg-chefmate-oat p-4">
            <div className="flex items-center gap-2 text-chefmate-muted">
              <Users className="h-4 w-4" />
              <span className="text-sm">Servings</span>
            </div>
            <p className="mt-3 text-xl font-semibold text-chefmate-ink">
              {recipe.serving.servings_count ?? "-"}
            </p>
          </div>
          <div className="rounded-[24px] bg-chefmate-oat p-4">
            <div className="flex items-center gap-2 text-chefmate-muted">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Style</span>
            </div>
            <p className="mt-3 text-xl font-semibold text-chefmate-ink">
              {titleCase(recipe.dietary_type[0] ?? "Recipe")}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-10 p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <CookingPot className="h-5 w-5 text-chefmate-terracotta" />
              <h2 className="text-xl font-semibold text-chefmate-ink">Ingredients</h2>
            </div>
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient) => (
                <div
                  key={`${ingredient.item}-${ingredient.quantity}`}
                  className="flex items-start justify-between gap-4 rounded-[24px] bg-[#eef4ef] px-4 py-4"
                >
                  <p className="font-medium text-chefmate-ink">{ingredient.item}</p>
                  <p className="text-sm text-chefmate-muted">{ingredient.quantity}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-chefmate-oat p-5">
              <p className="text-sm text-chefmate-muted">Calories</p>
              <p className="mt-2 text-2xl font-semibold text-chefmate-ink">
                {recipe.macros_per_serving.calories_kcal ?? "-"}
              </p>
            </div>
            <div className="rounded-[24px] bg-chefmate-oat p-5">
              <p className="text-sm text-chefmate-muted">Protein</p>
              <p className="mt-2 text-2xl font-semibold text-chefmate-ink">
                {recipe.macros_per_serving.protein_g ?? "-"}g
              </p>
            </div>
            <div className="rounded-[24px] bg-chefmate-oat p-5">
              <p className="text-sm text-chefmate-muted">Carbs</p>
              <p className="mt-2 text-2xl font-semibold text-chefmate-ink">
                {recipe.macros_per_serving.carbs_g ?? "-"}g
              </p>
            </div>
            <div className="rounded-[24px] bg-chefmate-oat p-5">
              <p className="text-sm text-chefmate-muted">Fibre</p>
              <p className="mt-2 text-2xl font-semibold text-chefmate-ink">
                {recipe.macros_per_serving.fibre_g ?? "-"}g
              </p>
            </div>
          </section>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-chefmate-ink">Steps</h2>
          <div className="space-y-4">
            {recipe.steps.map((step, index) => (
              <div key={`${index + 1}-${step}`} className="rounded-[28px] bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-chefmate-terracotta text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="leading-7 text-chefmate-ink">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
