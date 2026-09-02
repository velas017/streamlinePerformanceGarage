import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const OG_BACKGROUND_FILE = path.join(
  process.cwd(),
  "public",
  "images",
  "og",
  "og-background.jpg",
);

export interface OgImageInput {
  readonly title: string;
  readonly subtitle?: string;
  /** Data URL of a 1200×630 photo rendered behind the text. */
  readonly background?: string;
}

/** Loads the shared photo background at build time; returns undefined if the file is missing. */
export async function loadOgBackground(): Promise<string | undefined> {
  try {
    const buffer = await readFile(OG_BACKGROUND_FILE);
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/**
 * Shared renderer behind every opengraph-image.tsx so all social cards share one
 * brand treatment: the hero photo under a dark scrim, silver mark, white type.
 * Colors mirror the tokens in globals.css.
 */
export function renderOgImage({
  title,
  subtitle,
  background,
}: OgImageInput): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        padding: 72,
        background: "linear-gradient(135deg, #1e1e1e 0%, #0a0a0a 60%, #2a2a2a 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      {background ? (
        // eslint-disable-next-line @next/next/no-img-element -- Satori (ImageResponse) only renders plain <img>
        <img
          src={background}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(to top, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.7) 55%, rgba(10,10,10,0.3) 100%)",
        }}
      />
      <div
        style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}
      >
        <div
          style={{
            width: 28,
            height: 56,
            background: "#c7c9cf",
            transform: "skewX(-20deg)",
          }}
        />
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {siteConfig.name}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -1,
            textTransform: "uppercase",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 30, color: "#a9a9ae", maxWidth: 1000 }}>
          {subtitle ?? `${siteConfig.tagline} · Concord, NC · Serving Charlotte`}
        </div>
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
