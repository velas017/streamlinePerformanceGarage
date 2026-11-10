import type { Metadata } from "next";

/**
 * Metadata for an admin page, used in place of buildMetadata(): these pages
 * are private, so they get a title and a noindex and nothing to share.
 */
export function adminMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false } };
}

/** "streamline@example.com" -> "s•••e@example.com": enough to recognise, not to copy. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return email;
  const name = email.slice(0, at);
  const shown =
    name.length > 2 ? `${name[0]}•••${name[name.length - 1]}` : `${name[0]}•••`;
  return `${shown}${email.slice(at)}`;
}

const activityTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
});

/** "Nov 10, 2026, 2:14 PM" in the shop's time zone. */
export function formatActivityTime(iso: string): string {
  return activityTime.format(new Date(iso));
}
