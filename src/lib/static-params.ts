import { serviceAreas } from "@/content/service-areas";
import { services } from "@/content/services";
import { siteConfig } from "@/lib/site-config";

/** Shared by page.tsx and opengraph-image.tsx so both prerender the same set. */
export function serviceStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export function locationStaticParams() {
  return siteConfig.locations.map((location) => ({ slug: location.id }));
}

export function serviceAreaStaticParams() {
  return serviceAreas.map((area) => ({ slug: area.slug }));
}
