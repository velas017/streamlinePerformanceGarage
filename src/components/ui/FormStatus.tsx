"use client";

import { useEffect, type RefObject } from "react";
import { cn } from "@/lib/utils";

export type FormStatusKind = "idle" | "error" | "success";

export interface FormStatusProps {
  readonly id: string;
  readonly ref: RefObject<HTMLParagraphElement | null>;
  readonly status: FormStatusKind;
  /** Shown for "error" and "success"; ignored while idle. */
  readonly message?: string;
}

/**
 * The live region every form reports into (CLAUDE.md §5): always in the DOM so
 * screen readers announce a change, visually hidden until there is one.
 */
export function FormStatus({ id, ref, status, message }: FormStatusProps) {
  return (
    <p
      ref={ref}
      id={id}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-md border px-4 py-3 text-sm font-medium focus:outline-none",
        status === "idle" && "sr-only",
        status === "error" && "border-danger/50 bg-danger/10 text-fg",
        status === "success" && "border-success/50 bg-success/10 text-fg",
      )}
    >
      {status === "idle" ? "Form status messages will appear here." : message}
    </p>
  );
}

/**
 * After a submit, moves focus to the first invalid field, or to the status
 * message when no field is at fault or the submit succeeded. `state` is the
 * action's result: a new object per submit, so repeating an error refocuses.
 */
export function useFormResultFocus(
  state: { readonly status: FormStatusKind },
  formRef: RefObject<HTMLFormElement | null>,
  statusRef: RefObject<HTMLParagraphElement | null>,
): void {
  useEffect(() => {
    if (state.status === "error") {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      (firstInvalid ?? statusRef.current)?.focus();
    } else if (state.status === "success") {
      statusRef.current?.focus();
    }
  }, [state, formRef, statusRef]);
}
