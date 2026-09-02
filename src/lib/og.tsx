import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export interface OgImageInput {
  readonly title: string;
  readonly subtitle?: string;
}

/**
 * Shared renderer behind every opengraph-image.tsx so all social cards share one
 * brand treatment. Colors mirror the tokens in globals.css.
 */
export function renderOgImage({ title, subtitle }: OgImageInput): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #1e1e1e 0%, #0a0a0a 60%, #2a2a2a 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 28,
            height: 56,
            background: "#ff4d1c",
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
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
