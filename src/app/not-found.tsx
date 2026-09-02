import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Hero
      eyebrow="404"
      title="That page took a wrong turn"
      lead="The page you are looking for does not exist or has moved. Try one of these instead."
      actions={
        <>
          <Button href="/services" size="lg">
            Browse services
          </Button>
          <Button href="/locations" variant="secondary" size="lg">
            Find a shop
          </Button>
          <Button href="/contact" variant="ghost" size="lg">
            Contact us
          </Button>
        </>
      }
      className="min-h-[60dvh]"
    />
  );
}
