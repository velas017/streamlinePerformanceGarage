import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { Hero } from "@/components/sections/Hero";
import { LocationsSection } from "@/components/sections/LocationsSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { services } from "@/content/services";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Japanese Sports Car Services",
  description:
    "Every service we offer for Japanese cars in Concord, NC near Charlotte: alignments, suspension, wheels and tires, brakes, maintenance, diagnostics, engine work and dyno tuning.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Services", href: "/services" }]} />
      <Hero
        eyebrow="Services"
        title="Everything your Japanese sports car needs"
        lead="Performance work and everyday maintenance under one roof at our Concord, NC shop. Pick a service to see what is included and the questions owners ask most."
      />
      <ServicesGrid
        services={services}
        header={{ eyebrow: "All services", title: "Choose a service" }}
      />
      <LocationsSection />
      <CtaBanner />
    </>
  );
}
