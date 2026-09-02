"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import {
  initialContactFormState,
  submitLead,
  type ContactFormState,
} from "@/app/contact/actions";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { services } from "@/content/services";
import { HONEYPOT_FIELD } from "@/lib/leads";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const locationOptions = siteConfig.locations.map((location) => ({
  value: location.id,
  label: `${location.city}, ${location.address.addressRegion}`,
}));

const serviceOptions = [
  ...services.map((service) => ({ value: service.slug, label: service.name })),
  { value: "other", label: "Something else / not sure" },
];

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
              label="Name"
              required
              autoComplete="name"
              defaultValue={values?.name}
              error={errors.name}
            />
            <TextField
              id={id("email")}
              name="email"
              type="email"
              label="Email"
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
              label="Phone"
              autoComplete="tel"
              inputMode="tel"
              hint="Optional, but fastest for scheduling."
              defaultValue={values?.phone}
              error={errors.phone}
            />
            <TextField
              id={id("vehicle")}
              name="vehicle"
              label="Vehicle"
              required
              placeholder="2017 Nissan GT-R"
              defaultValue={values?.vehicle}
              error={errors.vehicle}
            />
            <SelectField
              id={id("location")}
              name="location"
              label="Preferred shop"
              required
              options={locationOptions}
              placeholder="Choose a shop"
              defaultValue={values?.location ?? ""}
              error={errors.location}
            />
            <SelectField
              id={id("service")}
              name="service"
              label="Service"
              required
              options={serviceOptions}
              placeholder="What do you need?"
              defaultValue={values?.service ?? ""}
              error={errors.service}
            />
          </div>
          <TextAreaField
            id={id("message")}
            name="message"
            label="Details"
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
