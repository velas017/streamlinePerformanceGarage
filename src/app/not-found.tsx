import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found" };

/**
 * Rendered directly inside the root layout (for unknown URLs and for
 * notFound() in any public page), so it brings the site chrome itself.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <Hero
        eyebrow="404"
        title="That page took a wrong turn"
        lead="The page you are looking for does not exist or has moved. Try one of these instead."
        actions={
          <>
            <Button href="/services" size="lg">
              Browse services
            </Button>
            <Button href="/gallery" variant="secondary" size="lg">
              See the gallery
            </Button>
            <Button href="/contact" variant="ghost" size="lg">
              Contact us
            </Button>
          </>
        }
        className="min-h-[60dvh]"
      />
    </SiteShell>
  );
}
