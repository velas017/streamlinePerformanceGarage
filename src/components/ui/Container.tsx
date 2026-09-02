import type { ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const container = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      content: "max-w-content",
      prose: "max-w-prose",
    },
  },
  defaultVariants: { size: "content" },
});

export interface ContainerProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof container> {}

/** Owns page max-width and horizontal gutters. Every section content sits inside one. */
export function Container({ size, className, ...rest }: ContainerProps) {
  return <div className={cn(container({ size }), className)} {...rest} />;
}
