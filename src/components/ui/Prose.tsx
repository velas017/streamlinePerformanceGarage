import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Long-form text block with readable measure and paragraph spacing. */
export function Prose({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "max-w-prose space-y-5 text-base leading-7 text-muted sm:text-lg sm:leading-8 [&_strong]:text-fg",
        className,
      )}
      {...rest}
    />
  );
}
