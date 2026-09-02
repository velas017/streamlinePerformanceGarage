import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const heading = cva("font-display font-bold tracking-tight text-fg", {
  variants: {
    size: {
      xl: "text-display-xl uppercase",
      lg: "text-display-lg uppercase",
      md: "text-display-md",
      sm: "text-display-sm",
      xs: "font-sans text-lg font-semibold tracking-normal",
    },
  },
  defaultVariants: { size: "md" },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

export interface HeadingProps
  extends Omit<ComponentPropsWithoutRef<"h2">, "color">, VariantProps<typeof heading> {
  /** Semantic level is independent of visual size (WCAG heading order). */
  readonly as?: HeadingTag;
}

export function Heading({ as = "h2", size, className, ...rest }: HeadingProps) {
  const Tag: ElementType = as;
  return <Tag className={cn(heading({ size }), className)} {...rest} />;
}
