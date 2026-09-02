import { z } from "zod";
import { isServiceSlug, type ServiceSlug } from "@/content/services";
import { env } from "@/lib/env";
import { isLocationId, type LocationId } from "@/lib/site-config";

const PHONE_PATTERN = /^[\d\s().+-]{7,20}$/;

/** Field names double as the form `name` attributes so the two can never drift. */
export const leadFields = [
  "name",
  "email",
  "phone",
  "vehicle",
  "location",
  "service",
  "message",
] as const;
export type LeadField = (typeof leadFields)[number];

/** Honeypot input name; bots fill it, humans never see it. */
export const HONEYPOT_FIELD = "company";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100, "Name is too long"),
  email: z.email("Enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (value) => value === "" || PHONE_PATTERN.test(value),
      "Enter a valid phone number",
    ),
  vehicle: z.string().trim().min(2, "Tell us the year, make and model").max(120),
  location: z.custom<LocationId>(
    (value) => typeof value === "string" && isLocationId(value),
    {
      message: "Choose a shop location",
    },
  ),
  service: z.custom<ServiceSlug | "other">(
    (value) => value === "other" || (typeof value === "string" && isServiceSlug(value)),
    { message: "Choose a service" },
  ),
  message: z.string().trim().max(2000, "Message is too long"),
});

export type Lead = z.infer<typeof leadSchema>;

/**
 * Delivery boundary for leads. Never silently drops a lead: in production a
 * missing webhook throws so the form surfaces an error with the phone number.
 */
export async function deliverLead(lead: Lead): Promise<void> {
  const webhook = env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    if (env.NODE_ENV === "production") {
      throw new Error("LEAD_WEBHOOK_URL is not configured");
    }
    console.warn("[leads] LEAD_WEBHOOK_URL not set; lead logged locally:", lead);
    return;
  }
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
  });
  if (!response.ok) {
    throw new Error(`Lead webhook responded ${response.status}`);
  }
}
