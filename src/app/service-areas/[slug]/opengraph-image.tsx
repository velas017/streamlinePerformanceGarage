import { getServiceArea } from "@/content/service-areas";
import { OG_CONTENT_TYPE, OG_SIZE, loadOgAssets, renderOgImage } from "@/lib/og";
import { siteConfig } from "@/lib/site-config";
import { serviceAreaStaticParams } from "@/lib/static-params";

export const alt = `${siteConfig.name} service area`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export function generateStaticParams() {
  return serviceAreaStaticParams();
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getServiceArea(slug);
  return renderOgImage({
    ...(await loadOgAssets()),
    title: area?.headline ?? siteConfig.tagline,
  });
}
