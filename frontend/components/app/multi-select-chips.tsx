"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

export function MultiSelectChips({
  options,
  value,
  onChange,
  tone = "secondary",
}: {
  options: readonly Option[];
  value: string[];
  onChange: (value: string[]) => void;
  tone?: "secondary" | "sage";
}) {
  function toggle(item: string) {
    onChange(
      value.includes(item) ? value.filter((entry) => entry !== item) : [...value, item],
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option.value);
        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={active ? (tone === "sage" ? "sage" : "default") : "secondary"}
            className={cn("rounded-full", !active && "bg-white")}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
