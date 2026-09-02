import type { Thing, WithContext } from "schema-dts";

export interface JsonLdProps {
  readonly data: WithContext<Thing> | readonly WithContext<Thing>[];
}

/**
 * Renders structured data the way the Next.js docs recommend: a plain JSON-LD
 * script (not next/script) with `<` escaped to prevent script injection.
 * Always feed it from the typed builders in lib/seo.ts.
 */
export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
