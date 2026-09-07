import type { Metadata } from "next";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { GalleryTeaser } from "@/components/sections/GalleryTeaser";
import { Hero } from "@/components/sections/Hero";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { ServicesCarousel } from "@/components/sections/ServicesCarousel";
import { TrustBar } from "@/components/sections/TrustBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { BookNowButton } from "@/components/layout/BookNowButton";
import { Button } from "@/components/ui/Button";
import { images } from "@/content/images";
import { featuredServices } from "@/content/services";
import { autoRepairSchema, buildMetadata } from "@/lib/seo";
import { primaryLocation, siteConfig } from "@/lib/site-config";
import { formatPhone, telHref } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} | Japanese Car Repair & Tuning in Concord, NC`,
  absoluteTitle: true,
  description: siteConfig.description,
  path: "/",
  keywords: [
    "Japanese car repair Concord NC",
    "Subaru mechanic Concord NC",
    "Nissan specialist Charlotte NC",
    "Honda performance shop Charlotte",
    "alignment shop Concord NC",
    "dyno tuning Charlotte NC",
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={siteConfig.locations.map(autoRepairSchema)} />
      <Hero
        eyebrow="Located in Concord, NC · Serving Charlotte and the surrounding area"
        title={
          <>
            Japanese Automotive Specialists
            <br />
            Service. Repair. Performance.
          </>
        }
        lead="Comprehensive Japanese Automotive Experts. Offering alignments, suspension, brakes, wheels and tires, performance upgrades, dyno tuning, engine work and honest repairs and maintenance for Subaru, Honda, Toyota, Nissan and other Japanese vehicles."
        image={images.hero}
        actions={
          <>
            <BookNowButton size="lg" />
            <Button
              href={telHref(primaryLocation.phone)}
              variant="secondary"
              size="lg"
              icon="phone"
              iconPosition="start"
            >
              Call {formatPhone(primaryLocation.phone)}
            </Button>
          </>
        }
      />
      <TrustBar />
      {/* Hidden at the client's request for now: MakesSection, Testimonials (placeholders until
          Google reviews are wired), LocationsSection and FaqSection. See CLAUDE.md §8. */}
      <ServicesCarousel services={featuredServices} />
      <GalleryTeaser />
      <InstagramFeed />
      <CtaBanner />
    </>
  );
}
