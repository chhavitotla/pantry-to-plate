import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-chefmate-terracotta text-white shadow-soft hover:-translate-y-0.5 hover:bg-[#df5c88]",
        secondary:
          "border border-chefmate-oat-deep bg-[#efe8dc] text-chefmate-ink hover:-translate-y-0.5 hover:bg-[#e8dfd2]",
        ghost: "text-chefmate-muted hover:bg-[#f2ece2]",
        outline:
          "border border-chefmate-oat-deep bg-white text-chefmate-ink hover:bg-[#f8f4ec]",
        plum: "bg-chefmate-plum text-white hover:bg-[#1d2840]",
        sage: "bg-[#e7efe9] text-chefmate-sage hover:bg-[#d9e6dc]",
      },
      size: {
        default: "h-12 px-5 py-2.5",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
