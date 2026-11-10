import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { GalleryWall } from "@/components/sections/GalleryWall";
import { Hero } from "@/components/sections/Hero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui/Section";
import { galleryPhotos } from "@/content/gallery";
import { buildMetadata, imageGallerySchema } from "@/lib/seo";

const title = "Photo Gallery";
const description =
  "Photos from inside Streamline Performance Garage in Concord, NC: Subaru, Honda, Nissan and Lexus builds in the bays, on the lifts, on the alignment rack and at the track.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/gallery" });

export default function GalleryPage() {
  return (
    <>
      <JsonLd
        data={imageGallerySchema({
          name: `${title} | Streamline Performance Garage`,
          description,
          path: "/gallery",
          photos: galleryPhotos,
        })}
      />
      <Breadcrumbs items={[{ name: "Gallery", href: "/gallery" }]} />
      <Hero
        eyebrow="Gallery"
        title="Builds, bays and track days"
        lead="A look inside the shop and at the cars that come through it. Tap any photo to see it full size."
      />
      <Section id="gallery" labelledBy="page-title" padding="tight">
        <GalleryWall photos={galleryPhotos} />
      </Section>
      <CtaBanner title="Want your car in here?" />
    </>
  );
}
