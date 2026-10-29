"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import {
  initialContactFormState,
  submitLead,
  type ContactFormState,
} from "@/app/contact/actions";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import {
  asksForShop,
  HONEYPOT_FIELD,
  leadFieldLabels,
  leadLocationOptions,
  leadServiceOptions,
} from "@/lib/leads";
import { cn } from "@/lib/utils";

function valuesOf(state: ContactFormState) {
  return state.status === "error" ? state.values : undefined;
}

function errorsOf(state: ContactFormState) {
  return state.status === "error" ? state.fieldErrors : {};
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitLead,
    initialContactFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const idPrefix = useId();
  const id = (field: string) => `${idPrefix}-${field}`;

  // Move focus to the first invalid field on error, or to the status message on success.
  useEffect(() => {
    if (state.status === "error") {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      (firstInvalid ?? statusRef.current)?.focus();
    } else if (state.status === "success") {
      statusRef.current?.focus();
    }
  }, [state]);

  const values = valuesOf(state);
  const errors = errorsOf(state);
  const isSuccess = state.status === "success";

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="flex flex-col gap-5"
      aria-describedby={id("status")}
    >
      <p
        ref={statusRef}
        id={id("status")}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={cn(
          "rounded-md border px-4 py-3 text-sm font-medium focus:outline-none",
          state.status === "idle" && "sr-only",
          state.status === "error" && "border-danger/50 bg-danger/10 text-fg",
          isSuccess && "border-success/50 bg-success/10 text-fg",
        )}
      >
        {state.status === "idle"
          ? "Form status messages will appear here."
          : state.message}
      </p>

      {isSuccess ? null : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id={id("name")}
              name="name"
              label={leadFieldLabels.name}
              required
              autoComplete="name"
              defaultValue={values?.name}
              error={errors.name}
            />
            <TextField
              id={id("email")}
              name="email"
              type="email"
              label={leadFieldLabels.email}
              required
              autoComplete="email"
              inputMode="email"
              defaultValue={values?.email}
              error={errors.email}
            />
            <TextField
              id={id("phone")}
              name="phone"
              type="tel"
              label={leadFieldLabels.phone}
              autoComplete="tel"
              inputMode="tel"
              hint="Optional, but fastest for scheduling."
              defaultValue={values?.phone}
              error={errors.phone}
            />
            <TextField
              id={id("vehicle")}
              name="vehicle"
              label={leadFieldLabels.vehicle}
              required
              placeholder="2017 Nissan GT-R"
              defaultValue={values?.vehicle}
              error={errors.vehicle}
            />
            {asksForShop ? (
              <SelectField
                id={id("location")}
                name="location"
                label={leadFieldLabels.location}
                required
                options={leadLocationOptions}
                placeholder="Choose a shop"
                defaultValue={values?.location ?? ""}
                error={errors.location}
              />
            ) : null}
            <SelectField
              id={id("service")}
              name="service"
              label={leadFieldLabels.service}
              // Alone on its row when there is no shop question beside it.
              className={asksForShop ? undefined : "sm:col-span-2"}
              required
              options={leadServiceOptions}
              placeholder="What do you need?"
              defaultValue={values?.service ?? ""}
              error={errors.service}
            />
          </div>
          <TextAreaField
            id={id("message")}
            name="message"
            label={leadFieldLabels.message}
            hint="Mods, symptoms, goals, or anything else that helps us plan."
            defaultValue={values?.message}
            error={errors.message}
          />

          {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px overflow-hidden"
          >
            <label htmlFor={id("company")}>Company</label>
            <input
              id={id("company")}
              name={HONEYPOT_FIELD}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" disabled={pending} aria-disabled={pending}>
              {pending ? "Sending…" : "Request appointment"}
            </Button>
            <p className="text-sm text-muted">We reply within one business day.</p>
          </div>
        </>
      )}
    </form>
  );
}
