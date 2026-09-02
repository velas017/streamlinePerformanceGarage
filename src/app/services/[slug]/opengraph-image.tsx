import { getService } from "@/content/services";
import { OG_CONTENT_TYPE, OG_SIZE, loadOgAssets, renderOgImage } from "@/lib/og";
import { siteConfig } from "@/lib/site-config";
import { serviceStaticParams } from "@/lib/static-params";

export const alt = `${siteConfig.name} service`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export function generateStaticParams() {
  return serviceStaticParams();
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  return renderOgImage({
    ...(await loadOgAssets()),
    title: service?.name ?? siteConfig.tagline,
    subtitle: service
      ? `Japanese automotive specialists · Concord, NC · Serving Charlotte`
      : undefined,
  });
}
