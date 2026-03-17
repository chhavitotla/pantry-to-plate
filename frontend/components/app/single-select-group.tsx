"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Option = {
  value: string;
  label: string;
};

export function SingleSelectGroup({
  value,
  onValueChange,
  options,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly Option[];
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
