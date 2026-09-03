import { z } from "zod";
import raw from "@/content/gallery.json";

/**
 * Gallery photo registry. Entries are appended by `npm run gallery:import`
 * (see scripts/import-gallery.mjs); alt and caption are written by hand.
 * Order in gallery.json is display order.
 */
const galleryPhotoSchema = z.object({
  id: z.string().min(1),
  sourceFile: z.string().min(1),
  src: z.string().startsWith("/images/gallery/"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string().startsWith("data:image/"),
  /** Descriptive alt text naming the car (CLAUDE.md §5). */
  alt: z.string(),
  /** Short caption shown on the tile and in the viewer. */
  caption: z.string(),
  addedAt: z.string(),
});

export type GalleryPhoto = z.infer<typeof galleryPhotoSchema>;

export const galleryPhotos: readonly GalleryPhoto[] = z
  .array(galleryPhotoSchema)
  .parse(raw);
