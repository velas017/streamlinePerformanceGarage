import { z } from "zod";
import { isServiceSlug, services, type ServiceSlug } from "@/content/services";
import { env } from "@/lib/env";
import { isLocationId, siteConfig, type LocationId } from "@/lib/site-config";

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

/** Visible field labels, shared by the form and the email the shop receives. */
export const leadFieldLabels = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  vehicle: "Vehicle",
  location: "Preferred shop",
  service: "Service",
  message: "Details",
} as const satisfies Record<LeadField, string>;

export const leadLocationOptions = siteConfig.locations.map((location) => ({
  value: location.id,
  label: `${location.city}, ${location.address.addressRegion}`,
}));

export const leadServiceOptions = [
  ...services.map((service) => ({ value: service.slug, label: service.name })),
  { value: "other", label: "Something else / not sure" },
];

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

const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;
const resendErrorSchema = z.object({ message: z.string() });

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

/**
 * The request as Resend's send-email body: plain text to the shop's inbox, with
 * Reply going straight to the customer. Anything but the live site is marked
 * [Test] so preview and local submissions never pass for real bookings.
 */
export function leadEmail(lead: Lead) {
  const shown: Record<LeadField, string> = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone || "Not given",
    vehicle: lead.vehicle,
    location: labelFor(leadLocationOptions, lead.location),
    service: labelFor(leadServiceOptions, lead.service),
    message: lead.message || "None",
  };
  const prefix = env.VERCEL_ENV === "production" ? "" : "[Test] ";
  const details = leadFields
    .filter((field) => field !== "message")
    .map((field) => `${leadFieldLabels[field]}: ${shown[field]}`);
  return {
    from: `${siteConfig.name} website <${siteConfig.leadSenderEmail}>`,
    to: [siteConfig.email],
    reply_to: lead.email,
    // Collapse whitespace so a pasted newline can't break the subject line.
    subject: `${prefix}Booking request: ${lead.name}, ${lead.vehicle}`.replace(
      /\s+/g,
      " ",
    ),
    text: [
      "New booking request from the website.",
      "",
      ...details,
      "",
      `${leadFieldLabels.message}:`,
      shown.message,
      "",
      `Reply to this email to answer ${lead.name} directly.`,
    ].join("\n"),
  };
}

/**
 * Delivery boundary for leads: emails each request to siteConfig.email through
 * Resend's REST API (one POST, so plain fetch instead of the SDK). Never
 * silently drops a lead: in production a missing key or a failed send throws
 * so the form surfaces an error with the phone number.
 */
export async function deliverLead(lead: Lead): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    if (env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not configured");
    }
    console.warn("[leads] RESEND_API_KEY not set; lead logged locally:", lead);
    return;
  }
  const response = await fetch(RESEND_EMAILS_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify(leadEmail(lead)),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  });
  if (!response.ok) {
    const error = resendErrorSchema.safeParse(await response.json().catch(() => null));
    throw new Error(
      `Resend responded ${response.status}${error.success ? `: ${error.data.message}` : ""}`,
    );
  }
}
