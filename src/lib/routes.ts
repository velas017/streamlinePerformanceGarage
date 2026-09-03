import type { Route } from "next";
import type { ServiceAreaSlug } from "@/content/service-areas";
import type { ServiceSlug } from "@/content/services";
import type { LocationId } from "@/lib/site-config";

export type ServiceHref = `/services/${ServiceSlug}`;
export type LocationHref = `/locations/${LocationId}`;
export type ServiceAreaHref = `/service-areas/${ServiceAreaSlug}`;
export type DynamicHref = ServiceHref | LocationHref | ServiceAreaHref;

/**
 * Every href the site may link to. `Route<...>` is checked against the route types
 * Next generates (`next typegen`), so a link to a page that does not exist fails
 * `npm run typecheck`. Dynamic segments are listed once as patterns whose unions
 * derive from content — never a hand-maintained URL list.
 */
export type AppHref = Route<DynamicHref>;

/** Static top-level routes, used by the sitemap and nav. Validated by typedRoutes. */
export const staticRoutes = [
  "/",
  "/services",
  "/locations",
  "/gallery",
  "/about",
  "/contact",
  "/privacy",
] as const satisfies readonly Route[];

export function serviceHref(slug: ServiceSlug): ServiceHref {
  return `/services/${slug}`;
}

export function locationHref(id: LocationId): LocationHref {
  return `/locations/${id}`;
}

export function serviceAreaHref(slug: ServiceAreaSlug): ServiceAreaHref {
  return `/service-areas/${slug}`;
}
