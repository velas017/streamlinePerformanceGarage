import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DAYS, type DayOfWeek, type OpeningHours } from "@/lib/site-config";
import { env } from "@/lib/env";

/** Merge Tailwind classes without duplicates or conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Build an absolute URL for canonical links, OG images and JSON-LD. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${env.NEXT_PUBLIC_SITE_URL}${normalized === "/" ? "" : normalized}`;
}

/** "+17045550101" -> "(704) 555-0101" for display. */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  const national =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return e164;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

/** Protocol hrefs are accepted by typedRoutes as `${string}:${string}`. */
export type TelHref = `tel:${string}`;
export type MailtoHref = `mailto:${string}`;

/** `tel:` href for an E.164 number. */
export function telHref(e164: string): TelHref {
  return `tel:${e164}`;
}

export function mailtoHref(email: string): MailtoHref {
  return `mailto:${email}`;
}

/** "08:00" -> "8:00 AM" */
export function formatTime(hhmm: string): string {
  const [hoursRaw, minutesRaw] = hhmm.split(":");
  const hours = Number(hoursRaw);
  const minutes = minutesRaw ?? "00";
  if (Number.isNaN(hours)) return hhmm;
  const suffix = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelveHour}:${minutes} ${suffix}`;
}

const SHORT_DAY: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

/** Collapse consecutive days into a range label: ["Monday".."Friday"] -> "Mon–Fri". */
export function formatDayRange(days: readonly DayOfWeek[]): string {
  if (days.length === 0) return "";
  const sorted = [...days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return "";
  const isConsecutive = sorted.every(
    (day, index) =>
      index === 0 || DAYS.indexOf(day) === DAYS.indexOf(sorted[index - 1] ?? day) + 1,
  );
  if (sorted.length === 1) return SHORT_DAY[first];
  if (isConsecutive) return `${SHORT_DAY[first]}–${SHORT_DAY[last]}`;
  return sorted.map((day) => SHORT_DAY[day]).join(", ");
}

export interface HoursRow {
  readonly days: string;
  readonly time: string;
}

/** Human-readable rows for a hours table, plus a "Closed" row for missing days. */
export function formatOpeningHours(hours: readonly OpeningHours[]): HoursRow[] {
  const rows = hours.map((entry) => ({
    days: formatDayRange(entry.dayOfWeek),
    time: `${formatTime(entry.opens)} – ${formatTime(entry.closes)}`,
  }));
  const covered = new Set(hours.flatMap((entry) => entry.dayOfWeek));
  const closedDays = DAYS.filter((day) => !covered.has(day));
  if (closedDays.length > 0) {
    rows.push({ days: formatDayRange(closedDays), time: "Closed" });
  }
  return rows;
}

/** Join a list with commas and a final "and" ("A, B and C"). */
export function joinWithAnd(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
