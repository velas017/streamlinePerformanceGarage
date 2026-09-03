#!/usr/bin/env node
/* eslint-disable no-console -- CLI script; its output is the point */
/**
 * Imports new photos from assets/source/gallery into the gallery.
 *
 *   npm run gallery:import
 *
 * For every image in assets/source/gallery that is not yet in
 * src/content/gallery.json, this writes an optimized, EXIF-stripped JPEG to
 * public/images/gallery/gallery-<name>.jpg, measures it, builds a blur
 * placeholder and appends a registry entry with empty alt/caption fields.
 * Fill those in (the test suite refuses blank ones), then commit.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT, "assets", "source", "gallery");
const OUT_DIR = path.join(ROOT, "public", "images", "gallery");
const REGISTRY = path.join(ROOT, "src", "content", "gallery.json");
const MAX_EDGE = 1600;
const ACCEPTED = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const registry = JSON.parse(await readFile(REGISTRY, "utf8").catch(() => "[]"));
const known = new Set(registry.map((entry) => entry.sourceFile));
await mkdir(OUT_DIR, { recursive: true });

const files = (await readdir(SOURCE_DIR).catch(() => []))
  .filter((file) => ACCEPTED.has(path.extname(file).toLowerCase()))
  .sort();

let added = 0;
for (const file of files) {
  if (known.has(file)) continue;
  const id = slugify(file);
  if (registry.some((entry) => entry.id === id)) {
    console.warn(`skip ${file}: id "${id}" already exists (rename the file)`);
    continue;
  }
  const source = sharp(path.join(SOURCE_DIR, file)).rotate();
  const meta = await source.metadata();
  const landscape = (meta.width ?? 0) >= (meta.height ?? 0);
  const outFile = `gallery-${id}.jpg`;
  const info = await source
    .clone()
    .resize(
      landscape
        ? { width: MAX_EDGE, withoutEnlargement: true }
        : { height: MAX_EDGE, withoutEnlargement: true },
    )
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(path.join(OUT_DIR, outFile));
  const blur = await source
    .clone()
    .resize({ width: 24 })
    .webp({ quality: 40 })
    .toBuffer();
  registry.push({
    id,
    sourceFile: file,
    src: `/images/gallery/${outFile}`,
    width: info.width,
    height: info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    alt: "",
    caption: "",
    addedAt: new Date().toISOString().slice(0, 10),
  });
  added += 1;
  console.log(
    `added ${file} -> ${outFile} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`,
  );
}

await writeFile(REGISTRY, `${JSON.stringify(registry, null, 2)}\n`);
if (added === 0) {
  console.log("Nothing new in assets/source/gallery.");
} else {
  console.log(
    `\n${added} photo(s) added. Now fill in "alt" and "caption" for each new entry in src/content/gallery.json.`,
  );
}
