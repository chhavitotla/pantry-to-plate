"use client";

import { Download, Loader2, Share2 } from "lucide-react";
import { toBlob, toPng } from "html-to-image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMinutes, titleCase } from "@/lib/formatters";
import type { Recipe } from "@/types/recipe";

type ShareCapableNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
};

export function ShareRecipeButton({ recipe }: { recipe: Recipe }) {
  const [isSaving, setIsSaving] = useState(false);
  const [shouldRenderCard, setShouldRenderCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function waitForCardMount() {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }

  async function ensureFontsReady() {
    if (typeof document === "undefined" || !("fonts" in document)) {
      return;
    }

    await Promise.race([
      document.fonts.ready,
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1200);
      }),
    ]);
  }

  async function captureRecipeCard(node: HTMLDivElement) {
    const pixelRatio =
      typeof window === "undefined" ? 1.5 : Math.min(2, Math.max(1, window.devicePixelRatio || 1.5));
    const width = node.scrollWidth || 900;
    const height = node.scrollHeight || 1200;

    const blob = await toBlob(node, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: "#fbf7ef",
      width,
      height,
      style: {
        transform: "none",
      },
    });

    if (blob) {
      return blob;
    }

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: "#fbf7ef",
      width,
      height,
      style: {
        transform: "none",
      },
    });

    const fallbackResponse = await fetch(dataUrl);
    return fallbackResponse.blob();
  }

  async function handleSave() {
    setIsSaving(true);
    setShouldRenderCard(true);

    try {
      await waitForCardMount();
      await ensureFontsReady();

      if (!cardRef.current) {
        throw new Error("Could not prepare recipe card.");
      }

      const blob = await captureRecipeCard(cardRef.current);

      const file = new File([blob], `${recipe.recipe_name}.png`, { type: "image/png" });
      const nav = navigator as ShareCapableNavigator;

      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          title: recipe.recipe_name,
          text: "From my pantry to my plate with ChefMate.",
          files: [file],
        });
        toast.success("Share sheet opened.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${recipe.recipe_name}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Recipe card downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the recipe card.");
    } finally {
      setShouldRenderCard(false);
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={handleSave} disabled={isSaving}>
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
        {isSaving ? "Preparing..." : "Save"}
      </Button>

      {shouldRenderCard ? (
        <div className="pointer-events-none fixed left-0 top-0 z-[-1] opacity-0">
          <div
            ref={cardRef}
            className="flex h-[1200px] w-[900px] flex-col justify-between overflow-hidden rounded-[48px] border border-chefmate-oat-deep bg-[#fbf7ef] p-14 text-chefmate-ink"
          >
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-chefmate-terracotta">
                    ChefMate
                  </p>
                  <h2 className="mt-4 font-display text-7xl font-extrabold leading-[0.95] tracking-[-0.05em]">
                    {recipe.recipe_name}
                  </h2>
                </div>
                <div className="rounded-full bg-white px-6 py-3 text-sm font-semibold shadow-soft">
                  From your pantry to your plate
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-[32px] bg-[#eaf0fb] p-6 shadow-soft">
                  <p className="text-sm text-chefmate-muted">Total time</p>
                  <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em]">
                    {formatMinutes(recipe.time.total_time_minutes)}
                  </p>
                </div>
                <div className="rounded-[32px] bg-[#e7efe9] p-6 shadow-soft">
                  <p className="text-sm text-chefmate-muted">Meal type</p>
                  <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em]">
                    {titleCase(recipe.meal_type[0] ?? "recipe")}
                  </p>
                </div>
                <div className="rounded-[32px] bg-[#fff2b8] p-6 shadow-soft">
                  <p className="text-sm text-chefmate-muted">Serves</p>
                  <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em]">
                    {recipe.serving.servings_count ?? "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-5 rounded-[36px] bg-white p-8 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-chefmate-plum">
                  Ingredients
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {recipe.ingredients.slice(0, 8).map((ingredient) => (
                    <div key={`${ingredient.item}-${ingredient.quantity}`} className="space-y-1">
                      <p className="text-lg font-semibold">{ingredient.item}</p>
                      <p className="text-sm text-chefmate-muted">{ingredient.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {recipe.nutrition_profile.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="sage" className="text-base">
                    {titleCase(tag)}
                  </Badge>
                ))}
                {recipe.time_effort_tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="saffron" className="text-base">
                    {titleCase(tag)}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="max-w-lg text-xl leading-8 text-chefmate-muted">
                  A low-effort cooking companion for hungry evenings.
                </p>
                <div className="flex items-center gap-2 rounded-full bg-chefmate-terracotta px-5 py-3 text-white">
                  <Download className="h-5 w-5" />
                  <span className="font-semibold">Saved with ChefMate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
