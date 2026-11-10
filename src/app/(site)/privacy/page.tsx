import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Hero } from "@/components/sections/Hero";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects the information you share when you contact our Concord or Charlotte, NC shops.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Privacy Policy", href: "/privacy" }]} />
      <Hero
        eyebrow="Legal"
        title="Privacy policy"
        lead="What we collect, why, and how to reach us about it."
      />
      <Section id="policy" labelledBy="policy-heading" containerSize="prose">
        <SectionHeader id="policy-heading" title="Your information" size="md" />
        <Prose>
          <p>
            When you submit our contact form we collect your name, email address, phone
            number (if provided), vehicle details and message so we can respond to your
            request and schedule service. We use this information only to communicate with
            you about your vehicle.
          </p>
          <p>
            We do not sell or rent your personal information. We share it only with the
            tools we use to receive and manage appointment requests, and only as needed to
            provide service.
          </p>
          <p>
            This site does not use advertising trackers. Standard server logs may record
            your IP address and browser type to keep the site secure and to prevent abuse
            of our forms.
          </p>
          <p>
            To request a copy of the information we hold about you, or to have it deleted,
            email{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="rounded-md text-accent underline-offset-4 focus-ring hover:underline"
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </Prose>
      </Section>
    </>
  );
}
