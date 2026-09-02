import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqSection } from "@/components/sections/FaqSection";
import { Hero } from "@/components/sections/Hero";
import { LocationCard } from "@/components/sections/LocationCard";
import { MapEmbed } from "@/components/sections/MapEmbed";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { locationContent } from "@/content/locations";
import { primaryCta } from "@/content/navigation";
import { services } from "@/content/services";
import { locationHref } from "@/lib/routes";
import { autoRepairSchema, buildMetadata } from "@/lib/seo";
import { getLocation, isLocationId } from "@/lib/site-config";
import { locationStaticParams } from "@/lib/static-params";
import { formatPhone, telHref } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return locationStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/locations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isLocationId(slug)) return {};
  const content = locationContent[slug];
  return buildMetadata({
    title: content.seo.title,
    description: content.seo.description,
    path: locationHref(slug),
    ...(content.seo.keywords ? { keywords: content.seo.keywords } : {}),
  });
}

export default async function LocationPage({ params }: PageProps<"/locations/[slug]">) {
  const { slug } = await params;
  if (!isLocationId(slug)) notFound();
  const location = getLocation(slug);
  const content = locationContent[slug];

  return (
    <>
      <JsonLd data={autoRepairSchema(location)} />
      <Breadcrumbs
        items={[
          { name: "Locations", href: "/locations" },
          { name: location.city, href: locationHref(location.id) },
        ]}
      />
      <Hero
        eyebrow={`${location.address.addressLocality}, ${location.address.addressRegion}`}
        title={content.headline}
        lead={`${location.address.streetAddress}, ${location.address.addressLocality}, ${location.address.addressRegion} ${location.address.postalCode}`}
        actions={
          <>
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>
            <Button
              href={telHref(location.phone)}
              variant="secondary"
              size="lg"
              icon="phone"
              iconPosition="start"
            >
              Call {formatPhone(location.phone)}
            </Button>
          </>
        }
      />

      <Section id="about-shop" labelledBy="about-shop-heading">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeader
              id="about-shop-heading"
              eyebrow="About this shop"
              title={`Inside our ${location.city} location`}
            />
            <Prose>
              {content.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p>
                <strong>Directions:</strong> {content.directions}
              </p>
            </Prose>
          </div>
          <LocationCard location={location} showDetailsLink={false} headingLevel="h3" />
        </div>
      </Section>

      <Section id="map" labelledBy="map-heading" tone="surface" padding="tight">
        <SectionHeader
          id="map-heading"
          eyebrow="Find us"
          title={`Map to the ${location.city} shop`}
          className="mb-6 sm:mb-8"
        />
        <MapEmbed
          location={location}
          className="aspect-[16/9] w-full rounded-lg border border-border lg:aspect-[21/9]"
        />
      </Section>

      <Section id="areas" labelledBy="areas-heading" padding="tight">
        <SectionHeader
          id="areas-heading"
          eyebrow="Service area"
          title={`Neighborhoods we serve from ${location.city}`}
          className="mb-6 sm:mb-8"
        />
        <ul className="flex flex-wrap gap-2">
          {content.neighborhoods.map((area) => (
            <li
              key={area}
              className="rounded-full border border-border-strong px-4 py-2 text-fg"
            >
              {area}
            </li>
          ))}
        </ul>
      </Section>

      <ServicesGrid
        services={services}
        compact
        tone="surface"
        header={{ eyebrow: "Services", title: `What we do in ${location.city}` }}
      />

      <FaqSection faqs={content.faqs} title={`${location.city} shop questions`} />
      <CtaBanner title={`Book your car in at ${location.city}`} />
    </>
  );
}
