import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServicesCarousel } from "@/components/sections/ServicesCarousel";
import { Testimonials } from "@/components/sections/Testimonials";
import { featuredServices } from "@/content/services";
import { testimonials } from "@/content/testimonials";
import { renderAccessible } from "@/test/render";

describe("home page carousels", () => {
  it("services carousel lists every featured service with named controls", async () => {
    await renderAccessible(<ServicesCarousel services={featuredServices} />);
    const list = screen.getByRole("list", { name: "Services" });
    expect(list.querySelectorAll("li")).toHaveLength(featuredServices.length);
    for (const service of featuredServices) {
      expect(screen.getByRole("link", { name: service.name })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /previous items/i })).toHaveAttribute(
      "aria-controls",
      list.id,
    );
    expect(screen.getByRole("button", { name: /next items/i })).toBeInTheDocument();
  });

  it("reviews carousel lists every testimonial", async () => {
    await renderAccessible(<Testimonials />);
    const list = screen.getByRole("list", { name: "Customer reviews" });
    expect(list.querySelectorAll("li")).toHaveLength(testimonials.length);
  });
});
