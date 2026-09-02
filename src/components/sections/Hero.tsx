import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { cn } from "@/lib/utils";

export interface HeroProps {
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  readonly eyebrow?: string;
  /** Full-bleed background photo. Only the home page hero should set this. */
  readonly image?: { readonly src: string; readonly alt: string };
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
}

/**
 * The page-top section: always contains the single <h1>. With an image it becomes
 * the cinematic full-bleed hero (home); without it a compact page header.
 */
export function Hero({
  title,
  lead,
  eyebrow,
  image,
  actions,
  children,
  className,
}: HeroProps) {
  const isFullBleed = Boolean(image);
  return (
    <section
      aria-labelledby="page-title"
      className={cn(
        "relative isolate overflow-hidden bg-bg",
        isFullBleed
          ? "flex min-h-[calc(100dvh-4rem)] items-end lg:min-h-[calc(100dvh-5rem)]"
          : "border-b border-border",
        className,
      )}
    >
      {image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            quality={85}
            preload
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/30"
          />
        </>
      ) : null}

      <Container
        className={cn(
          "relative",
          isFullBleed ? "py-20 sm:py-28 lg:py-36" : "py-14 sm:py-20 lg:py-24",
        )}
      >
        <div className="flex max-w-3xl flex-col gap-5">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <Heading as="h1" size={isFullBleed ? "xl" : "lg"} id="page-title">
            {title}
          </Heading>
          {lead ? <p className="max-w-2xl text-lead text-muted">{lead}</p> : null}
          {actions ? (
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {actions}
            </div>
          ) : null}
          {children}
        </div>
      </Container>
    </section>
  );
}
