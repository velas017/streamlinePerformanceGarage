import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { Hero } from "@/components/sections/Hero";
import { LocationCard } from "@/components/sections/LocationCard";
import { ServiceAreaCard } from "@/components/sections/ServiceAreaCard";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { serviceAreas } from "@/content/service-areas";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { joinWithAnd } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Our Concord, NC Shop & Service Area",
  description:
    "Visit Streamline Performance Garage at 5978 Grand National Ln SW in Concord, NC, just off I-85 near Charlotte Motor Speedway. Hours, directions and the Charlotte-area communities we serve.",
  path: "/locations",
});

export default function LocationsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Location", href: "/locations" }]} />
      <Hero
        eyebrow="Location"
        title="One shop in Concord, serving the Charlotte metro"
        lead={`We serve ${joinWithAnd(siteConfig.serviceAreas)} and the surrounding ${joinWithAnd(siteConfig.counties)} area from our shop just off I-85.`}
      />
      <Section id="shop" labelledBy="shop-heading">
        <SectionHeader id="shop-heading" eyebrow="Visit us" title="The shop" />
        <ul className="grid gap-6 lg:grid-cols-2">
          {siteConfig.locations.map((location) => (
            <li key={location.id} className="flex">
              <LocationCard location={location} headingLevel="h3" />
            </li>
          ))}
        </ul>
      </Section>
      <Section id="areas" labelledBy="areas-heading" tone="surface">
        <SectionHeader
          id="areas-heading"
          eyebrow="Service area"
          title="Where our customers drive in from"
          description="Most of our customers are within a 30-minute drive. These pages explain what to expect from your part of the metro."
        />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceAreas.map((area) => (
            <li key={area.slug} className="flex">
              <ServiceAreaCard area={area} />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBanner />
    </>
  );
}
