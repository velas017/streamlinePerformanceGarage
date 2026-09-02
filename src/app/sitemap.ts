import type { MetadataRoute } from "next";
import { serviceAreas } from "@/content/service-areas";
import { services } from "@/content/services";
import { locationHref, serviceAreaHref, serviceHref, staticRoutes } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/utils";

/** Generated from route data — never a hand-maintained URL list (CLAUDE.md §7). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...siteConfig.locations.map((location) => ({
      url: absoluteUrl(locationHref(location.id)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...serviceAreas.map((area) => ({
      url: absoluteUrl(serviceAreaHref(area.slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...services.map((service) => ({
      url: absoluteUrl(serviceHref(service.slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
