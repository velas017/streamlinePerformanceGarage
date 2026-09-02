import { locationContent } from "@/content/locations";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { isLocationId, siteConfig } from "@/lib/site-config";
import { locationStaticParams } from "@/lib/static-params";

export const alt = `${siteConfig.name} location`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export function generateStaticParams() {
  return locationStaticParams();
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLocationId(slug)) return renderOgImage({ title: siteConfig.tagline });
  return renderOgImage({ title: locationContent[slug].headline });
}
