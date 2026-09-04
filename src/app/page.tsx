import type { Metadata } from "next";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqSection } from "@/components/sections/FaqSection";
import { GalleryTeaser } from "@/components/sections/GalleryTeaser";
import { Hero } from "@/components/sections/Hero";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { LocationsSection } from "@/components/sections/LocationsSection";
import { MakesSection } from "@/components/sections/MakesSection";
import { ServicesCarousel } from "@/components/sections/ServicesCarousel";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustBar } from "@/components/sections/TrustBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { generalFaqs } from "@/content/faqs";
import { images } from "@/content/images";
import { primaryCta } from "@/content/navigation";
import { featuredServices } from "@/content/services";
import { autoRepairSchema, buildMetadata } from "@/lib/seo";
import { primaryLocation, siteConfig } from "@/lib/site-config";
import { formatPhone, joinWithAnd, telHref } from "@/lib/utils";

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
        eyebrow="Concord, NC · Serving Charlotte"
        title={
          <>
            Japanese automotive specialists,
            <br className="hidden sm:block" /> built for how you drive
          </>
        }
        lead={`Alignments, suspension, brakes, wheels and tires, dyno tuning, engine work and honest maintenance for ${joinWithAnd(siteConfig.primaryMakes)} and the rest of the Japanese performance lineup. One shop in Concord, serving the whole Charlotte metro.`}
        image={images.hero}
        actions={
          <>
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>
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
      <ServicesCarousel services={featuredServices} />
      <MakesSection />
      <GalleryTeaser />
      <InstagramFeed />
      <Testimonials />
      <LocationsSection />
      <FaqSection faqs={generalFaqs} />
      <CtaBanner />
    </>
  );
}
