import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { InternalLink } from "@/components/ui/Link";
import { AddressLink } from "@/components/sections/AddressLink";
import { HoursTable } from "@/components/sections/HoursTable";
import { visibility } from "@/content/visibility";
import { locationHref } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";
import { formatPhone, joinWithAnd, mailtoHref, telHref } from "@/lib/utils";

const footerLinkClasses =
  "focus-ring inline-flex min-h-11 items-center rounded-md text-muted hover:text-fg";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="flex flex-col gap-6">
            <Logo />
            <p className="max-w-sm text-muted">
              {siteConfig.tagline}. {siteConfig.description.split(". ")[0]}.
            </p>
            <ul className="flex gap-2" aria-label="Social media">
              {siteConfig.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${footerLinkClasses} px-2`}
                  >
                    {social.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* NAP blocks — identical data to site-config everywhere (CLAUDE.md §7). */}
          <div className="grid gap-10 sm:grid-cols-2">
            {siteConfig.locations.map((location) => (
              <address key={location.id} className="flex flex-col gap-3 not-italic">
                <h2 className="font-display text-xl font-bold tracking-wide uppercase">
                  {visibility.locationPages ? (
                    <InternalLink
                      href={locationHref(location.id)}
                      className="rounded-md focus-ring hover:text-accent"
                    >
                      {location.city}, {location.address.addressRegion}
                    </InternalLink>
                  ) : (
                    `${location.city}, ${location.address.addressRegion}`
                  )}
                </h2>
                <AddressLink location={location} />
                <a
                  href={telHref(location.phone)}
                  className={`${footerLinkClasses} gap-2`}
                >
                  <Icon name="phone" />
                  {formatPhone(location.phone)}
                </a>
                <HoursTable hours={location.hours} compact />
              </address>
            ))}
          </div>
        </div>

        {/* The Services / Visit / Company link columns were removed at the client's
            request (2026-10-21); the header nav covers the same pages. */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted">
          <p>
            Serving {joinWithAnd(siteConfig.serviceAreas)} and the greater{" "}
            {joinWithAnd(siteConfig.counties)} area.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
            <p>
              © {year} {siteConfig.legalName}. All rights reserved.
            </p>
            <a href={mailtoHref(siteConfig.email)} className={footerLinkClasses}>
              {siteConfig.email}
            </a>
            <InternalLink href="/privacy" className={footerLinkClasses}>
              Privacy Policy
            </InternalLink>
          </div>
        </div>
      </Container>
    </footer>
  );
}
