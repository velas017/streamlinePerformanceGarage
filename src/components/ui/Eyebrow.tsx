import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Small uppercase label above a heading. Purely visual; never a heading itself. */
export function Eyebrow({ className, ...rest }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn(
        "font-sans text-xs font-semibold tracking-[0.2em] text-accent uppercase",
        className,
      )}
      {...rest}
    />
  );
}
