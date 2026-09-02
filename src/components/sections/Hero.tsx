import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import type { SiteImage } from "@/content/images";
import { cn } from "@/lib/utils";

export interface HeroProps {
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  readonly eyebrow?: string;
  /** Hero photo. Only the home page hero should set this. */
  readonly image?: SiteImage;
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
}

/**
 * The page-top section: always contains the single <h1>.
 *
 * With an image the photo is the point, so it stays clear:
 * - small screens: the photo is its own full-width band above the text (no tint),
 *   so the whole car is visible on landing and the copy sits on solid black;
 * - large screens: full-bleed photo with the headline above the car and the lead
 *   + CTAs below it. The scrim darkens only those two bands (see `hero-scrim`),
 *   leaving the middle of the frame, where the car sits, nearly untouched.
 * Without an image it is a compact page header.
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
  const headline = (
    <div className="flex max-w-5xl flex-col gap-4">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading
        as="h1"
        size={image ? "xl" : "lg"}
        id="page-title"
        // On large screens the photo hero fits the headline in two lines above the car.
        className={cn(image && "lg:text-[clamp(2.5rem,4.4vw,4.25rem)]")}
      >
        {title}
      </Heading>
    </div>
  );

  const supporting = (
    <div className="flex max-w-3xl flex-col gap-5">
      {lead ? (
        <p className={cn("text-lead text-muted", image && "lg:text-base lg:text-fg/90")}>
          {lead}
        </p>
      ) : null}
      {actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
      ) : null}
      {children}
    </div>
  );

  if (!image) {
    return (
      <section
        aria-labelledby="page-title"
        className={cn(
          "relative isolate overflow-hidden border-b border-border bg-bg",
          className,
        )}
      >
        <Container className="relative flex flex-col gap-5 py-14 sm:py-20 lg:py-24">
          {headline}
          {supporting}
        </Container>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="page-title"
      className={cn(
        "relative isolate overflow-hidden bg-bg",
        // Large screens: always full width. Height = 16:9 of the viewport width, capped to
        // the viewport (minus header) so CTAs stay above the fold, but never below the floor
        // (24vw + 23rem) that keeps the headline and copy bands clear of the car in the photo.
        // (aspect-ratio + max-height would shrink the WIDTH instead, leaving a black strip.)
        "lg:h-[max(calc(24vw_+_23rem),min(56.25vw,calc(100dvh_-_5rem)))]",
        className,
      )}
    >
      {/* Photo: a 3:2 band on small screens, full-bleed behind the copy on large screens. */}
      <div className="relative aspect-[3/2] w-full lg:absolute lg:inset-0 lg:aspect-auto">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          quality={75}
          preload
          fetchPriority="high"
          {...(image.blurDataURL
            ? { placeholder: "blur" as const, blurDataURL: image.blurDataURL }
            : {})}
          className="object-cover object-center"
        />
        {/* Small screens: a short fade so the band meets the black copy area. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg to-transparent lg:hidden"
        />
        {/* Large screens: dark top and bottom bands only. */}
        <div aria-hidden="true" className="absolute inset-0 hidden hero-scrim lg:block" />
      </div>

      <Container className="relative flex flex-col gap-6 py-8 sm:py-10 lg:absolute lg:inset-x-0 lg:inset-y-0 lg:h-full lg:justify-between lg:py-10">
        {headline}
        {supporting}
      </Container>
    </section>
  );
}
