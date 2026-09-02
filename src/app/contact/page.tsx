import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContactForm } from "@/components/sections/ContactForm";
import { FaqSection } from "@/components/sections/FaqSection";
import { Hero } from "@/components/sections/Hero";
import { LocationCard } from "@/components/sections/LocationCard";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { generalFaqs } from "@/content/faqs";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Book Service or Contact Us",
  description:
    "Book an appointment at Streamline Performance Garage in Concord, NC. Request alignments, tuning, repairs or maintenance for your Subaru, Nissan or Honda online, or call the shop.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
      <Hero
        eyebrow="Contact & booking"
        title="Book your car in"
        lead="Tell us what you drive and what you need. We confirm most requests within one business day, and you can always call the shop directly."
      />
      <Section id="booking" labelledBy="booking-heading">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeader
              id="booking-heading"
              eyebrow="Request an appointment"
              title="Send us the details"
              className="mb-8"
            />
            <ContactForm />
          </div>
          <div className="flex flex-col gap-6">
            {siteConfig.locations.map((location) => (
              <LocationCard key={location.id} location={location} headingLevel="h3" />
            ))}
          </div>
        </div>
      </Section>
      <FaqSection faqs={generalFaqs} />
    </>
  );
}
