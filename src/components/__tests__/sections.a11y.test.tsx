import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { FaqSection } from "@/components/sections/FaqSection";
import { Hero } from "@/components/sections/Hero";
import { LocationCard } from "@/components/sections/LocationCard";
import { LocationsSection } from "@/components/sections/LocationsSection";
import { MakesSection } from "@/components/sections/MakesSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustBar } from "@/components/sections/TrustBar";
import { Button } from "@/components/ui/Button";
import { generalFaqs } from "@/content/faqs";
import { images } from "@/content/images";
import { featuredServices } from "@/content/services";
import { getLocation } from "@/lib/site-config";
import { formatPhone } from "@/lib/utils";
import { renderAccessible } from "@/test/render";

describe("page sections", () => {
  it("Hero renders the single h1 and CTAs", async () => {
    await renderAccessible(
      <Hero
        eyebrow="Test"
        title="Heading"
        lead="Lead"
        image={images.hero}
        actions={<Button href="/contact">Book</Button>}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Heading" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("ServicesGrid renders one link per service", async () => {
    await renderAccessible(
      <ServicesGrid services={featuredServices} header={{ title: "Services" }} />,
    );
    for (const service of featuredServices) {
      expect(screen.getByRole("link", { name: service.name })).toHaveAttribute(
        "href",
        `/services/${service.slug}`,
      );
    }
  });

  it("LocationCard exposes address, phone and hours", async () => {
    const location = getLocation("concord");
    await renderAccessible(<LocationCard location={location} />);
    expect(
      screen.getByRole("link", { name: formatPhone(location.phone) }),
    ).toHaveAttribute("href", `tel:${location.phone}`);
    expect(screen.getByText("Mon–Fri")).toBeInTheDocument();
  });

  it("FaqSection uses native disclosure widgets and emits FAQPage schema", async () => {
    const { container } = await renderAccessible(<FaqSection faqs={generalFaqs} />);
    expect(container.querySelectorAll("details")).toHaveLength(generalFaqs.length);
    expect(
      container.querySelector('script[type="application/ld+json"]')?.textContent,
    ).toContain('"FAQPage"');
  });

  it("remaining sections have no axe violations", async () => {
    await renderAccessible(
      <>
        <TrustBar />
        <MakesSection />
        <Testimonials />
        <LocationsSection />
        <CtaBanner />
      </>,
    );
  });
});
