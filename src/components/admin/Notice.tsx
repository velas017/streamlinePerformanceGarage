import type { ReactNode } from "react";

/** A boxed one-line message that is part of the page (not a form result). */
export function Notice({ children }: { readonly children: ReactNode }) {
  return (
    <p className="rounded-md border border-border-strong bg-surface px-4 py-3 text-sm font-medium text-fg">
      {children}
    </p>
  );
}
