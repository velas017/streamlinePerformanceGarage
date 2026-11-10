"use client";

import { useActionState, useId, useRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { FormStatus, useFormResultFocus } from "@/components/ui/FormStatus";
import type { AdminFormContent } from "@/content/admin";
import { idleFormState, type AdminFormAction } from "@/lib/admin/form-state";

export interface AdminFormProps {
  readonly action: AdminFormAction;
  /** Fields and button labels, from content/admin.ts. */
  readonly content: AdminFormContent;
  /** Values sent along unseen, such as the token of a password link. */
  readonly hidden?: Readonly<Record<string, string>>;
  readonly variant?: ButtonProps["variant"];
  /** Rendered beside the submit button (a secondary link, say). */
  readonly children?: ReactNode;
}

/**
 * Every form in the admin area: fields come from data, errors are wired to
 * their fields, the result is announced and focused, and passwords and codes
 * are never sent back into the page after a failed submit.
 */
export function AdminForm({
  action,
  content,
  hidden,
  variant,
  children,
}: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, idleFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const idPrefix = useId();
  const statusId = `${idPrefix}-status`;
  useFormResultFocus(state, formRef, statusRef);

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const codes = state.status === "success" ? (state.codes ?? []) : [];

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="flex flex-col gap-5"
      aria-describedby={statusId}
    >
      <FormStatus
        id={statusId}
        ref={statusRef}
        status={state.status}
        message={state.status === "idle" ? undefined : state.message}
      />

      {codes.length > 0 ? (
        <ul
          aria-label="Your new backup codes"
          className="grid grid-cols-1 gap-2 rounded-md border border-border-strong bg-bg p-4 font-mono text-lg tracking-wider text-fg sm:grid-cols-2"
        >
          {codes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      ) : null}

      {content.fields.map((field) => (
        <TextField
          key={field.name}
          id={`${idPrefix}-${field.name}`}
          name={field.name}
          type={field.type}
          label={field.label}
          required
          autoComplete={field.autoComplete}
          inputMode={field.inputMode}
          maxLength={field.maxLength}
          hint={field.hint}
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={values[field.name]}
          error={errors[field.name]}
        />
      ))}

      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          variant={variant}
          disabled={pending}
          aria-disabled={pending}
        >
          {pending ? content.pendingLabel : content.submitLabel}
        </Button>
        {children}
      </div>
    </form>
  );
}
