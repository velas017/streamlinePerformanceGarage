"use client";

import { useEffect } from "react";
import { Hero } from "@/components/sections/Hero";
import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  /** Next 16: re-fetches and re-renders the segment. */
  readonly retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Hero
      eyebrow="Something went wrong"
      title="We hit a snag loading this page"
      lead="Try again, or head back to the home page. If it keeps happening, give us a call."
      actions={
        <>
          <Button size="lg" onClick={retry}>
            Try again
          </Button>
          <Button href="/" variant="secondary" size="lg">
            Go home
          </Button>
        </>
      }
      className="min-h-[60dvh]"
    />
  );
}
