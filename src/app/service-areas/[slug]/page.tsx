import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqSection } from "@/components/sections/FaqSection";
import { Hero } from "@/components/sections/Hero";
import { LocationCard } from "@/components/sections/LocationCard";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Button } from "@/components/ui/Button";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryCta } from "@/content/navigation";
import { getServiceArea } from "@/content/service-areas";
import { services } from "@/content/services";
import { serviceAreaHref } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { primaryLocation } from "@/lib/site-config";
import { serviceAreaStaticParams } from "@/lib/static-params";
import { formatPhone, telHref } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceAreaStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/service-areas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const area = getServiceArea(slug);
  if (!area) return {};
  return buildMetadata({
    title: area.seo.title,
    description: area.seo.description,
    path: serviceAreaHref(area.slug),
    ...(area.seo.keywords ? { keywords: area.seo.keywords } : {}),
  });
}

/**
 * Service-area landing page: honest local-SEO content for a city we serve.
 * Deliberately carries no LocalBusiness schema or address — that belongs to the
 * shop's own location page.
 */
export default async function ServiceAreaPage({
  params,
}: PageProps<"/service-areas/[slug]">) {
  const { slug } = await params;
  const area = getServiceArea(slug);
  if (!area) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Location", href: "/locations" },
          { name: `Serving ${area.name}`, href: serviceAreaHref(area.slug) },
        ]}
      />
      <Hero
        eyebrow={`Serving ${area.name}, ${area.region}`}
        title={area.headline}
        lead={area.lead}
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

      <Section id="about-area" labelledBy="about-area-heading">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeader
              id="about-area-heading"
              eyebrow="Worth the drive"
              title={`Why ${area.name} drivers come to Concord`}
            />
            <Prose>
              {area.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Prose>
          </div>
          <LocationCard location={primaryLocation} headingLevel="h3" />
        </div>
      </Section>

      <Section
        id="neighborhoods"
        labelledBy="neighborhoods-heading"
        tone="surface"
        padding="tight"
      >
        <SectionHeader
          id="neighborhoods-heading"
          eyebrow="Service area"
          title={`${area.name} neighborhoods we serve`}
          className="mb-6 sm:mb-8"
        />
        <ul className="flex flex-wrap gap-2">
          {area.neighborhoods.map((neighborhood) => (
            <li
              key={neighborhood}
              className="rounded-full border border-border-strong px-4 py-2 text-fg"
            >
              {neighborhood}
            </li>
          ))}
        </ul>
      </Section>

      <ServicesGrid
        services={services}
        compact
        header={{ eyebrow: "Services", title: `What we do for ${area.name} drivers` }}
      />

      <FaqSection faqs={area.faqs} title={`Questions from ${area.name} drivers`} />
      <CtaBanner title={`Book your car in from ${area.name}`} />
    </>
  );
}
