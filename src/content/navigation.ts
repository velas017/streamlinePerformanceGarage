import { serviceAreas } from "@/content/service-areas";
import { services } from "@/content/services";
import { type AppHref, locationHref, serviceAreaHref, serviceHref } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

export interface NavLink {
  readonly label: string;
  readonly href: AppHref;
}

export interface NavItem extends NavLink {
  readonly children?: readonly NavLink[];
}

const serviceLinks: readonly NavLink[] = services.map((service) => ({
  label: service.shortName,
  href: serviceHref(service.slug),
}));

const locationLinks: readonly NavLink[] = [
  ...siteConfig.locations.map((location) => ({
    label: `${location.city} shop`,
    href: locationHref(location.id),
  })),
  ...serviceAreas.map((area) => ({
    label: `Serving ${area.name}`,
    href: serviceAreaHref(area.slug),
  })),
];

/** Drives both the desktop nav and the mobile menu. */
export const mainNavigation: readonly NavItem[] = [
  { label: "Services", href: "/services", children: serviceLinks },
  { label: "Location", href: "/locations", children: locationLinks },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export interface FooterGroup {
  readonly heading: string;
  readonly links: readonly NavLink[];
}

export const footerNavigation: readonly FooterGroup[] = [
  { heading: "Services", links: serviceLinks },
  { heading: "Visit", links: locationLinks },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact & Booking", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export const primaryCta: NavLink = { label: "Book service", href: "/contact" };
