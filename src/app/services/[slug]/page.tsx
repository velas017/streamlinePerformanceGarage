import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqSection } from "@/components/sections/FaqSection";
import { Hero } from "@/components/sections/Hero";
import { LocationsSection } from "@/components/sections/LocationsSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryCta } from "@/content/navigation";
import { getService, services } from "@/content/services";
import { serviceHref } from "@/lib/routes";
import { buildMetadata, serviceSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { serviceStaticParams } from "@/lib/static-params";
import { telHref } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return buildMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: serviceHref(service.slug),
    ...(service.seo.keywords ? { keywords: service.seo.keywords } : {}),
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = service.related
    .map((relatedSlug) => services.find((candidate) => candidate.slug === relatedSlug))
    .filter((candidate) => candidate !== undefined);

  return (
    <>
      <JsonLd data={serviceSchema(service)} />
      <Breadcrumbs
        items={[
          { name: "Services", href: "/services" },
          { name: service.name, href: serviceHref(service.slug) },
        ]}
      />
      <Hero
        eyebrow="Service · Concord, NC · Serving Charlotte"
        title={service.name}
        lead={service.summary}
        actions={
          <>
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>
            <Button
              href={telHref(siteConfig.primaryPhone)}
              variant="secondary"
              size="lg"
              icon="phone"
              iconPosition="start"
            >
              Call to discuss
            </Button>
          </>
        }
      />

      <Section id="overview" labelledBy="overview-heading">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <SectionHeader
              id="overview-heading"
              eyebrow="Overview"
              title={`How we approach ${service.shortName.toLowerCase()}`}
            />
            <Prose>
              {service.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Prose>
          </div>
          <Card className="h-fit lg:sticky lg:top-28">
            <h3 className="text-display-sm">What is included</h3>
            <ul className="flex flex-col gap-3">
              {service.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 text-muted">
                  <Icon name="check" className="mt-1 text-accent" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <LocationsSection
        header={{
          eyebrow: "Where",
          title: `${service.shortName} at our Concord shop`,
          description:
            "Just off I-85 near Charlotte Motor Speedway. Charlotte, Kannapolis and Harrisburg drivers make the trip every week.",
        }}
      />

      {related.length > 0 ? (
        <ServicesGrid
          id="related"
          services={related}
          compact
          header={{ eyebrow: "Related", title: "Owners also book" }}
        />
      ) : null}

      <FaqSection faqs={service.faqs} title={`${service.shortName} questions`} />
      <CtaBanner title={`Book ${service.shortName.toLowerCase()} today`} />
    </>
  );
}
