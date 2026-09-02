import type { Metadata } from "next";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqSection } from "@/components/sections/FaqSection";
import { Hero } from "@/components/sections/Hero";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { LocationsSection } from "@/components/sections/LocationsSection";
import { MakesSection } from "@/components/sections/MakesSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustBar } from "@/components/sections/TrustBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { generalFaqs } from "@/content/faqs";
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
        image={{
          src: "/images/hero-japanese-sports-car-concord-nc.svg",
          alt: `Subaru WRX STI on the lift inside the ${siteConfig.name} shop in Concord, North Carolina`,
        }}
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
      <ServicesGrid
        services={featuredServices}
        header={{
          eyebrow: "What we do",
          title: "Performance and repair, done properly",
          description:
            "From a factory-schedule oil change to a full engine build, every job gets the same documentation, the same standards and the same technicians.",
        }}
        footer={
          <Button href="/services" variant="secondary" icon="arrow-right">
            See all services
          </Button>
        }
      />
      <MakesSection />
      <InstagramFeed />
      <Testimonials />
      <LocationsSection />
      <FaqSection faqs={generalFaqs} />
      <CtaBanner />
    </>
  );
}
