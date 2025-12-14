import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        neon: 
          "relative bg-transparent text-white rounded-full font-bold transition-shadow duration-300 " +
          "hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] " + 
          // This pseudo-element creates the gradient border while keeping the center clear
          "before:absolute before:inset-0 before:rounded-full before:p-[2px] " +
          "before:bg-gradient-to-r before:from-blue-500 before:to-pink-500 " +
          "before:content-[''] before:-z-10 " +
          "before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] " +
          "before:[mask-composite:exclude]",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
