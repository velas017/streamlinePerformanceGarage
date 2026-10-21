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
import { FaqList } from "@/components/ui/FaqList";
import { generalFaqs } from "@/content/faqs";
import { images } from "@/content/images";
import { featuredServices } from "@/content/services";
import { visibility } from "@/content/visibility";
import { getLocation } from "@/lib/site-config";
import { formatPhone } from "@/lib/utils";
import { locationPageLinks } from "@/test/links";
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

  it("ServicesGrid renders one card per service, linked only while pages are published", async () => {
    await renderAccessible(
      <ServicesGrid services={featuredServices} header={{ title: "Services" }} />,
    );
    for (const service of featuredServices) {
      expect(
        screen.getByRole("heading", { level: 3, name: service.name }),
      ).toBeInTheDocument();
      const links = screen.queryAllByRole("link", { name: service.name });
      if (visibility.servicePages) {
        expect(links[0]).toHaveAttribute("href", `/services/${service.slug}`);
      } else {
        expect(links).toHaveLength(0);
      }
    }
  });

  it("LocationsSection links to the location pages only while they are visible", async () => {
    const { container } = await renderAccessible(<LocationsSection />);
    expect(locationPageLinks(container).length > 0).toBe(visibility.locationPages);
  });

  it("LocationCard exposes address, phone and hours", async () => {
    const location = getLocation("concord");
    await renderAccessible(<LocationCard location={location} />);
    expect(
      screen.getByRole("link", { name: formatPhone(location.phone) }),
    ).toHaveAttribute("href", `tel:${location.phone}`);
    expect(
      screen.getByRole("link", { name: new RegExp(location.address.streetAddress) }),
    ).toHaveAttribute("href", location.mapsUrl);
    expect(screen.getByText("Mon–Fri")).toBeInTheDocument();
  });

  it("FaqList uses native disclosure widgets", async () => {
    const { container } = await renderAccessible(<FaqList items={generalFaqs} />);
    expect(container.querySelectorAll("details")).toHaveLength(generalFaqs.length);
  });

  it("FaqSection renders FAQs and FAQPage schema only while FAQs are visible", async () => {
    const { container } = await renderAccessible(<FaqSection faqs={generalFaqs} />);
    expect(container.querySelectorAll("details")).toHaveLength(
      visibility.faqs ? generalFaqs.length : 0,
    );
    const schema = container.querySelector('script[type="application/ld+json"]');
    if (visibility.faqs) {
      expect(schema?.textContent).toContain('"FAQPage"');
    } else {
      expect(schema).toBeNull();
    }
  });

  it("remaining sections have no axe violations", async () => {
    await renderAccessible(
      <>
        <TrustBar />
        <MakesSection />
        <Testimonials />
        <CtaBanner />
      </>,
    );
  });
});
