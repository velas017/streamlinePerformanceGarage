import type { ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Container, type ContainerProps } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const section = cva("relative", {
  variants: {
    tone: {
      default: "bg-bg",
      surface: "bg-surface",
      accent: "bg-accent text-accent-fg [--color-focus:var(--color-accent-fg)]",
    },
    padding: {
      default: "py-16 sm:py-20 lg:py-28",
      tight: "py-10 sm:py-12 lg:py-16",
      none: "",
    },
  },
  defaultVariants: { tone: "default", padding: "default" },
});

export interface SectionProps
  extends
    Omit<ComponentPropsWithoutRef<"section">, "aria-labelledby">,
    VariantProps<typeof section> {
  /** id of the heading element that names this section (required for landmarks). */
  readonly labelledBy: string;
  readonly containerSize?: ContainerProps["size"];
}

/**
 * Page section = landmark + vertical rhythm + container. Pair with SectionHeader
 * so every section is named for assistive technology.
 */
export function Section({
  labelledBy,
  tone,
  padding,
  containerSize,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(section({ tone, padding }), className)}
      {...rest}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}
