import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { Hero } from "@/components/sections/Hero";
import { LocationsSection } from "@/components/sections/LocationsSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { images } from "@/content/images";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { joinWithAnd } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "About Our Japanese Automotive Shop",
  description:
    "Streamline Performance Garage is an independent, enthusiast-run Japanese automotive shop in Concord, NC serving Charlotte. Learn how we work and why Subaru, Nissan and Honda owners trust us.",
  path: "/about",
});

const values: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: "clipboard-check",
    title: "Documented, not guessed",
    body: "Alignment printouts, datalogs, dyno graphs and photo inspections. You get evidence for every recommendation and every result.",
  },
  {
    icon: "car",
    title: "Japanese platforms only",
    body: "Specializing lets us keep the right tools, factory-level diagnostics and parts relationships for the cars we love.",
  },
  {
    icon: "shield",
    title: "Honest scope",
    body: "We tell you what your car needs and what it does not. If a stock part is the right answer, that is what we recommend.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "About", href: "/about" }]} />
      <Hero
        eyebrow="About"
        title="Enthusiast-run, specialist-focused"
        lead={`${siteConfig.name} is the independent shop Carolina owners trust with the Japanese cars they care about most.`}
      />
      <Section id="story" labelledBy="story-heading">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              id="story-heading"
              eyebrow="Our story"
              title="An independent shop built around Japanese cars"
            />
            {/* TODO(owner): replace with the real founding story, team and milestones. */}
            <Prose>
              <p>
                {siteConfig.name} is an independent, enthusiast-run shop in Concord, North
                Carolina that works on Japanese cars and nothing else.{" "}
                {joinWithAnd(siteConfig.primaryMakes)} fill most of the bays, alongside
                Toyota, Mazda, Mitsubishi and Lexus, from daily drivers to full builds.
              </p>
              <p>
                The idea is simple: give Japanese car owners a shop that treats their cars
                with the same obsession they do, and back every recommendation with data.
                Alignments and suspension setups are measured, tunes come with datalogs
                and dyno sheets, and you always get a clear explanation before any work
                begins.
              </p>
              <p>
                We are just off I-85 near Charlotte Motor Speedway, which makes us an easy
                drive from Charlotte, Kannapolis, Harrisburg and the whole north side of
                the metro.
              </p>
            </Prose>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
            <Image
              src={images.aboutShopFloor.src}
              alt={images.aboutShopFloor.alt}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section id="values" labelledBy="values-heading" tone="surface">
        <SectionHeader
          id="values-heading"
          eyebrow="How we work"
          title="What you can expect"
        />
        <ul className="grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <li key={value.title} className="flex">
              <Card className="w-full">
                <Icon name={value.icon} className="size-8 text-accent" />
                <h3 className="text-display-sm">{value.title}</h3>
                <p className="text-muted">{value.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <TrustBar />
      <LocationsSection />
      <CtaBanner />
    </>
  );
}
