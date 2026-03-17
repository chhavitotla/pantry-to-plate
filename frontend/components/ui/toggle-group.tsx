"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

import { cn } from "@/lib/utils";

const ToggleGroupContext = React.createContext<{
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}>({
  variant: "default",
  size: "default",
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
  }
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex flex-wrap gap-2", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full border border-chefmate-oat-deep bg-white px-4 text-sm font-medium text-chefmate-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-chefmate-oat data-[state=on]:border-transparent data-[state=on]:bg-chefmate-plum data-[state=on]:text-white data-[state=on]:shadow-soft",
        context.size === "sm" && "min-h-9 px-3 text-xs",
        context.size === "lg" && "min-h-12 px-5 text-base",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
