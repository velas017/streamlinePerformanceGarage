import type { IconName } from "@/components/ui/Icon";
import { siteConfig } from "@/lib/site-config";
import { joinWithAnd } from "@/lib/utils";

export interface TrustPoint {
  readonly icon: IconName;
  readonly label: string;
  readonly detail: string;
}

/** TODO(owner): confirm certification and warranty claims before launch. */
export const trustPoints = [
  {
    icon: "car",
    label: `${joinWithAnd(siteConfig.primaryMakes)} specialists`,
    detail: "Japanese platforms only, so the tools and the know-how are always in-house.",
  },
  {
    icon: "gauge",
    label: "Alignment rack & dyno on site",
    detail: "Performance alignments and dyno tuning verified with data, never guessed.",
  },
  {
    icon: "shield",
    label: "Parts & labor warranty",
    detail: "Every repair is backed by a written warranty.",
  },
  {
    icon: "map-pin",
    label: "Concord, NC · serving Charlotte",
    detail: "Just off I-85 near Charlotte Motor Speedway, 20 minutes from Uptown.",
  },
] as const satisfies readonly TrustPoint[];
