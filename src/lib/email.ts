import { z } from "zod";
import { env } from "@/lib/env";

/**
 * The one place the site sends email: Resend's REST API (a single POST, so
 * plain fetch instead of the SDK). Callers decide what a missing key means;
 * this module never drops a message silently.
 */
const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;
const resendErrorSchema = z.object({ message: z.string() });

/** Resend's send-email body, limited to what the site uses. */
export interface EmailMessage {
  readonly from: string;
  readonly to: readonly string[];
  readonly subject: string;
  readonly text: string;
  readonly reply_to?: string;
}

export interface SendEmailOptions {
  /** The same key within 24 hours is delivered once (Resend idempotency). */
  readonly idempotencyKey?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

/** Everything but the live site is marked so a test email never passes for a real one. */
export function subjectPrefix(): string {
  return env.VERCEL_ENV === "production" ? "" : "[Test] ";
}

/** Sends one email. Throws when the key is missing or Resend refuses the send. */
export async function sendEmail(
  message: EmailMessage,
  { idempotencyKey }: SendEmailOptions = {},
): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const response = await fetch(RESEND_EMAILS_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  });
  if (!response.ok) {
    const error = resendErrorSchema.safeParse(await response.json().catch(() => null));
    throw new Error(
      `Resend responded ${response.status}${error.success ? `: ${error.data.message}` : ""}`,
    );
  }
}
