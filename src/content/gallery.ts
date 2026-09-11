import { z } from "zod";
import raw from "@/content/gallery.json";

/**
 * Gallery photo registry. Entries are appended by `npm run gallery:import`
 * (see scripts/import-gallery.mjs); alt text is written by hand. Nothing is
 * printed on the tiles: the alt is the only description (feeds Google Images
 * and the ImageGallery schema) and the client asked for no visible captions.
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
  addedAt: z.string(),
});

export type GalleryPhoto = z.infer<typeof galleryPhotoSchema>;

export const galleryPhotos: readonly GalleryPhoto[] = z
  .array(galleryPhotoSchema)
  .parse(raw);
