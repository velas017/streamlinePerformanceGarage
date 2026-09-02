import { Button } from "@/components/ui/Button";
import { env } from "@/lib/env";
import type { SiteLocation } from "@/lib/site-config";

export interface MapEmbedProps {
  readonly location: SiteLocation;
  readonly className?: string;
}

/**
 * Google Maps embed when an API key is configured; otherwise a directions link so
 * the page never renders a broken iframe.
 */
export function MapEmbed({ location, className }: MapEmbedProps) {
  const key = env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  if (!key) {
    return (
      <div className={className}>
        <Button
          href={location.mapsUrl}
          variant="secondary"
          icon="map-pin"
          iconPosition="start"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open {location.city} shop in Google Maps
          <span className="sr-only"> (opens in a new tab)</span>
        </Button>
      </div>
    );
  }
  const src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(location.mapsEmbedQuery)}`;
  return (
    <iframe
      title={`Map showing ${location.name}`}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className={className}
    />
  );
}
