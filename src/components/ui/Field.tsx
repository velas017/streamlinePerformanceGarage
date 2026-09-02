import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

const controlClasses =
  "focus-ring w-full rounded-md border border-border-strong bg-surface px-4 py-3 text-fg placeholder:text-muted/70 aria-[invalid=true]:border-danger min-h-12";

interface FieldShellProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly error?: string;
  readonly className?: string;
  readonly children: (a11y: {
    readonly id: string;
    readonly "aria-describedby": string | undefined;
    readonly "aria-invalid": true | undefined;
    readonly "aria-required": true | undefined;
    readonly className: string;
  }) => ReactNode;
}

/**
 * Label + control + hint + error with the ARIA wiring WCAG requires: visible
 * label, required marked in text, errors linked via aria-describedby and
 * aria-invalid. Every form control on the site goes through this.
 */
function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-medium text-fg">
        {label}
        {required ? <span className="text-muted"> (required)</span> : null}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
        className: controlClasses,
      })}
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type ShellProps = Omit<FieldShellProps, "children">;

export interface TextFieldProps
  extends
    ShellProps,
    Omit<ComponentPropsWithoutRef<"input">, "id" | "className" | "required"> {}

export function TextField({
  id,
  label,
  required,
  hint,
  error,
  className,
  ...input
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      {(a11y) => <input {...a11y} {...input} />}
    </FieldShell>
  );
}

export interface TextAreaFieldProps
  extends
    ShellProps,
    Omit<ComponentPropsWithoutRef<"textarea">, "id" | "className" | "required"> {}

export function TextAreaField({
  id,
  label,
  required,
  hint,
  error,
  className,
  ...textarea
}: TextAreaFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      {(a11y) => (
        <textarea {...a11y} {...textarea} className={cn(a11y.className, "min-h-32")} />
      )}
    </FieldShell>
  );
}

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectFieldProps
  extends
    ShellProps,
    Omit<ComponentPropsWithoutRef<"select">, "id" | "className" | "required"> {
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
}

export function SelectField({
  id,
  label,
  required,
  hint,
  error,
  className,
  options,
  placeholder,
  ...select
}: SelectFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
    >
      {(a11y) => (
        <select {...a11y} {...select}>
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}
