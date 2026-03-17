"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestedIngredients = [
  "tomato",
  "egg",
  "rice",
  "garlic",
  "spinach",
  "onion",
  "yogurt",
  "paneer",
];

export function PantryInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const filteredSuggestions = suggestedIngredients.filter((item) => !value.includes(item));

  function addIngredient(raw: string) {
    const ingredient = raw.trim().toLowerCase();
    if (!ingredient || value.includes(ingredient)) {
      return;
    }

    onChange([...value, ingredient]);
    setDraft("");
  }

  function removeIngredient(target: string) {
    onChange(value.filter((item) => item !== target));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addIngredient(draft);
            }
          }}
          placeholder="What do you have? rice, tomato, spinach..."
          className="h-13 flex-1"
        />
        <Button type="button" onClick={() => addIngredient(draft)} className="sm:min-w-36">
          <Plus className="h-4 w-4" />
          Add ingredient
        </Button>
      </div>

      <div className="flex min-h-12 flex-wrap gap-2">
        {value.length > 0 ? (
          value.map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="gap-2 rounded-full border-chefmate-oat-deep bg-white px-4 py-2 text-sm shadow-sm"
            >
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => removeIngredient(item)}
                className="rounded-full text-chefmate-muted transition hover:text-chefmate-terracotta"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-chefmate-muted">
            Start with a few ingredients and ChefMate will do the thinking.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredSuggestions.slice(0, 6).map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => addIngredient(item)}
            className="rounded-full"
          >
            + {item}
          </Button>
        ))}
      </div>
    </div>
  );
}
