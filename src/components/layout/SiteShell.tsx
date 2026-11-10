import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, webSiteSchema } from "@/lib/seo";

/**
 * The public site's chrome: skip link, header, the one <main>, footer and the
 * organization JSON-LD. Used by the (site) layout and by the root 404 page,
 * which renders outside that layout. The admin area has its own shell.
 */
export function SiteShell({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header />
      {/* Skip-link target: outline removed only here because the landmark itself is the focus destination. */}
      <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        {children}
      </main>
      <Footer />
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />
    </>
  );
}
