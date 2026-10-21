/**
 * Parts of the site the client asked to hide "for now" (email of 2026-10-21).
 * Nothing is deleted: the pages, components and copy stay in the codebase, and
 * each switch hides or restores one part everywhere it appears at once.
 */
export interface SiteVisibility {
  /**
   * The individual /services/[slug] pages. While false, service cards are not
   * links (no "Learn more"), the nav and sitemap leave the pages out, and
   * next.config.ts temporarily redirects their URLs to /services. That redirect
   * cannot read this file, so a test fails if the two ever disagree.
   */
  readonly servicePages: boolean;
  /**
   * The /locations and /service-areas/* pages. They stay live and in the
   * sitemap so searches can still land on them, but while false nothing on the
   * site links to them: no "Location" menu item, footer link or card link.
   */
  readonly locationPages: boolean;
  /** Every FAQ section (contact, location, service-area and service pages) and its FAQPage schema. */
  readonly faqs: boolean;
}

export const visibility: SiteVisibility = {
  servicePages: false,
  locationPages: false,
  faqs: false,
};
