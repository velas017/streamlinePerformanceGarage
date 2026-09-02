import { OG_CONTENT_TYPE, OG_SIZE, loadOgBackground, renderOgImage } from "@/lib/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} – ${siteConfig.tagline} in Concord, NC · Serving Charlotte`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    title: siteConfig.tagline,
    subtitle: `${siteConfig.primaryMakes.join(" · ")} · Concord, NC · Serving Charlotte`,
    background: await loadOgBackground(),
  });
}
