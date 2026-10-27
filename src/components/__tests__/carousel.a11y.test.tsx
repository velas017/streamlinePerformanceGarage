import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MakesSection } from "@/components/sections/MakesSection";
import { ServicesCarousel } from "@/components/sections/ServicesCarousel";
import { makes } from "@/content/makes";
import { featuredServices } from "@/content/services";
import { visibility } from "@/content/visibility";
import { renderAccessible } from "@/test/render";

describe("home page carousels", () => {
  it("services carousel lists every featured service with named controls", async () => {
    await renderAccessible(<ServicesCarousel services={featuredServices} />);
    const list = screen.getByRole("list", { name: "Services" });
    expect(list.querySelectorAll("li")).toHaveLength(featuredServices.length);
    for (const service of featuredServices) {
      expect(
        screen.getByRole("heading", { level: 3, name: service.name }),
      ).toBeInTheDocument();
      // Cards link to their pages only while the service pages are published.
      expect(screen.queryAllByRole("link", { name: service.name })).toHaveLength(
        visibility.servicePages ? 1 : 0,
      );
    }
    expect(screen.queryAllByText(/learn more/i)).toHaveLength(
      visibility.servicePages ? featuredServices.length : 0,
    );
    expect(screen.getByRole("button", { name: /previous items/i })).toHaveAttribute(
      "aria-controls",
      list.id,
    );
    expect(screen.getByRole("button", { name: /next items/i })).toBeInTheDocument();
    // Only the reviews carousel rotates on its own.
    expect(screen.queryByRole("button", { name: /automatic scrolling/i })).toBeNull();
  });

  it("makes carousel lists every make", async () => {
    await renderAccessible(<MakesSection />);
    const list = screen.getByRole("list", { name: "Makes we specialize in" });
    expect(list.querySelectorAll(":scope > li")).toHaveLength(makes.length);
  });
});
