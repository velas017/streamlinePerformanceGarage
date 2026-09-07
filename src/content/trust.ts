import type { IconName } from "@/components/ui/Icon";

export interface TrustPoint {
  readonly icon: IconName;
  readonly label: string;
  readonly detail: string;
}

/** Copy supplied by the shop (2026-09-07). */
export const trustPoints = [
  {
    icon: "car",
    label: "Subaru, Honda, Nissan & Toyota",
    detail: "Japanese specific, so the experience and the know-how are always in-house.",
  },
  {
    icon: "gauge",
    label: "Hunter Engineering laser alignment machine & Mustang AWD dyno",
    detail:
      "Performance alignments and dyno tuning verified with accurate data, never guessed.",
  },
  {
    icon: "cog",
    label: "Full range of performance parts & upgrades",
    detail:
      "We are dealers for the biggest names in the performance industry. Contact us for a quote.",
  },
  {
    icon: "map-pin",
    label: "Conveniently located in Concord, NC",
    detail: "Just off I-85 near Charlotte Motor Speedway, 20 minutes from Uptown.",
  },
] as const satisfies readonly TrustPoint[];
