"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  deliverLead,
  HONEYPOT_FIELD,
  leadFields,
  leadSchema,
  type LeadField,
} from "@/lib/leads";
import { isRateLimited } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { formatPhone } from "@/lib/utils";

export type LeadValues = Record<LeadField, string>;

export type ContactFormState =
  | { readonly status: "idle" }
  | { readonly status: "success"; readonly message: string }
  | {
      readonly status: "error";
      readonly message: string;
      readonly fieldErrors: Partial<Record<LeadField, string>>;
      readonly values: LeadValues;
    };

export const initialContactFormState: ContactFormState = { status: "idle" };

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 } as const;

function readValues(formData: FormData): LeadValues {
  const values = {} as LeadValues;
  for (const field of leadFields) {
    const raw = formData.get(field);
    values[field] = typeof raw === "string" ? raw : "";
  }
  return values;
}

function firstErrors(error: z.ZodError): Partial<Record<LeadField, string>> {
  const flattened = z.flattenError(error).fieldErrors as Partial<
    Record<LeadField, string[]>
  >;
  const result: Partial<Record<LeadField, string>> = {};
  for (const field of leadFields) {
    const first = flattened[field]?.[0];
    if (first) result[field] = first;
  }
  return result;
}

export async function submitLead(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = readValues(formData);
  const successMessage =
    "Thanks! We received your request and will confirm a time shortly.";
  const fallback = `Please call us at ${formatPhone(siteConfig.primaryPhone)}.`;

  // Bots fill the hidden field; pretend it worked so they stop retrying.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { status: "success", message: successMessage };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip, RATE_LIMIT)) {
    return {
      status: "error",
      message: `Too many requests. ${fallback}`,
      fieldErrors: {},
      values,
    };
  }

  const parsed = leadSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: firstErrors(parsed.error),
      values,
    };
  }

  try {
    await deliverLead(parsed.data);
  } catch (error) {
    console.error("[contact] lead delivery failed", error);
    return {
      status: "error",
      message: `We could not send your request. ${fallback}`,
      fieldErrors: {},
      values,
    };
  }

  return { status: "success", message: successMessage };
}
