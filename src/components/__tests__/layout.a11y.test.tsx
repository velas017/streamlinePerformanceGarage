import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { siteConfig } from "@/lib/site-config";
import { expectNoA11yViolations } from "@/test/a11y";
import { render } from "@testing-library/react";

describe("layout chrome", () => {
  it("Header has a named primary nav, a menu button and the CTA", async () => {
    const { container } = render(<Header />);
    await expectNoA11yViolations(container);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveAttribute("aria-controls");
  });

  it("Footer renders NAP for every location from site-config", async () => {
    const { container } = render(<Footer />);
    await expectNoA11yViolations(container);
    for (const location of siteConfig.locations) {
      expect(
        screen.getByText(new RegExp(location.address.streetAddress)),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("navigation", { name: "Footer" })).toBeInTheDocument();
  });

  it("SkipLink targets #main", () => {
    render(<SkipLink />);
    expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute(
      "href",
      "#main",
    );
  });

  it("Breadcrumbs mark the current page and emit JSON-LD", async () => {
    const { container } = render(
      <Breadcrumbs items={[{ name: "Services", href: "/services" }]} />,
    );
    await expectNoA11yViolations(container);
    expect(screen.getByText("Services")).toHaveAttribute("aria-current", "page");
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.textContent).toContain('"BreadcrumbList"');
  });
});
