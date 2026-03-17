import { RecipeCard } from "@/components/app/recipe-card";
import { Reveal } from "@/components/shared/reveal";
import type { Recipe } from "@/types/recipe";

export function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {recipes.map((recipe, index) => (
        <Reveal key={recipe.recipe_id} delay={Math.min(index * 70, 280)}>
          <RecipeCard recipe={recipe} />
        </Reveal>
      ))}
    </div>
  );
}
