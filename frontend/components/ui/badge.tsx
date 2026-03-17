import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-chefmate-oat-deep text-chefmate-ink",
        terracotta: "border-transparent bg-chefmate-terracotta/16 text-[#cf4f7a]",
        sage: "border-transparent bg-chefmate-sage text-[#2f5d4f]",
        saffron: "border-transparent bg-chefmate-saffron text-[#7c6412]",
        plum: "border-transparent bg-chefmate-plum/12 text-chefmate-plum",
        outline: "border-chefmate-oat-deep text-chefmate-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
