import type { ComponentPropsWithoutRef } from "react";
import { InternalLink, type InternalLinkProps } from "@/components/ui/Link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const card = cva(
  "relative flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8",
  {
    variants: {
      interactive: {
        true: "transition-colors focus-within:border-accent hover:border-border-strong hover:bg-surface-2 motion-safe:duration-200",
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  },
);

export interface CardProps
  extends ComponentPropsWithoutRef<"div">, VariantProps<typeof card> {}

export function Card({ interactive, className, ...rest }: CardProps) {
  return <div className={cn(card({ interactive }), className)} {...rest} />;
}

export type CardLinkProps = InternalLinkProps;

/**
 * Stretched link that makes the whole parent Card clickable while keeping a
 * single, meaningful link in the accessibility tree. Parent Card must be
 * `relative` (it is) and `interactive`.
 */
export function CardLink({ className, ...rest }: CardLinkProps) {
  return (
    <InternalLink
      className={cn(
        "font-semibold text-accent focus-ring after:absolute after:inset-0 after:rounded-lg after:content-['']",
        className,
      )}
      {...rest}
    />
  );
}
