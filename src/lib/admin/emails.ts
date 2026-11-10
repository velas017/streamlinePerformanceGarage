import { CHALLENGE_TTL_SECONDS, RESET_TTL_SECONDS } from "@/lib/admin/store";
import { isEmailConfigured, sendEmail, subjectPrefix } from "@/lib/email";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

/** The two emails the admin area sends: the sign-in code and the password link. */

const FROM = `${siteConfig.name} admin <${siteConfig.adminSenderEmail}>`;
const IGNORE_NOTE =
  "If this was not you, you can ignore this email. Nobody can get in without your password.";

function minutes(seconds: number): string {
  return `${Math.round(seconds / 60)} minutes`;
}

/**
 * Sends to one admin. Locally, without a Resend key, the email is printed to
 * the terminal instead so the sign-in flow can be tried; in production a
 * missing key throws like any other failed send.
 */
async function send(
  to: string,
  subject: string,
  lines: readonly string[],
): Promise<void> {
  const text = lines.join("\n");
  if (!isEmailConfigured() && env.NODE_ENV !== "production") {
    console.warn(
      `[admin] RESEND_API_KEY not set; email to ${to} logged locally:\n${text}`,
    );
    return;
  }
  await sendEmail({
    from: FROM,
    to: [to],
    subject: `${subjectPrefix()}${subject}`,
    text,
  });
}

export async function sendSignInCode(to: string, code: string): Promise<void> {
  await send(to, `Your sign-in code: ${code}`, [
    `Your ${siteConfig.name} admin sign-in code is:`,
    "",
    code,
    "",
    `It works once and expires in ${minutes(CHALLENGE_TTL_SECONDS)}.`,
    "",
    "If this was not you, someone knows your password: sign in and change it.",
  ]);
}

export async function sendPasswordLink(to: string, url: string): Promise<void> {
  await send(to, "Choose your admin password", [
    `Use this link to choose a password for the ${siteConfig.name} admin area:`,
    "",
    url,
    "",
    `It works once and expires in ${minutes(RESET_TTL_SECONDS)}.`,
    "",
    IGNORE_NOTE,
  ]);
}
