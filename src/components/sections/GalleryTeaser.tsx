import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { InternalLink } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { galleryPhotos } from "@/content/gallery";

const TEASER_COUNT = 4;

/** Home page strip of the latest gallery photos, linking to the full wall. */
export function GalleryTeaser() {
  const photos = galleryPhotos.slice(0, TEASER_COUNT);
  if (photos.length === 0) return null;
  return (
    <Section id="gallery-teaser" labelledBy="gallery-teaser-heading" tone="surface">
      <SectionHeader
        id="gallery-teaser-heading"
        eyebrow="Gallery"
        title="From the shop"
        description="Builds, bays and track days. A look at the cars that come through Concord."
      />
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <li key={photo.id}>
            <InternalLink
              href="/gallery"
              aria-label={`Open the gallery: ${photo.caption}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-surface-2 focus-ring"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                className="object-cover transition-transform group-hover:scale-[1.03] motion-safe:duration-300"
              />
            </InternalLink>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-center">
        <Button href="/gallery" variant="secondary" icon="arrow-right">
          See the gallery
        </Button>
      </div>
    </Section>
  );
}
