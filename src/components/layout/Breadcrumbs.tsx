import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { InternalLink } from "@/components/ui/Link";
import { breadcrumbSchema, type BreadcrumbItem } from "@/lib/seo";

export interface BreadcrumbsProps {
  /** Trail excluding Home, which is always prepended. */
  readonly items: readonly BreadcrumbItem[];
}

/** Visible breadcrumb trail + matching BreadcrumbList JSON-LD (CLAUDE.md §7). */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const trail: readonly BreadcrumbItem[] = [{ name: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="border-b border-border bg-bg">
      <JsonLd data={breadcrumbSchema(trail)} />
      <Container>
        <ol className="flex flex-wrap items-center gap-1 py-2 text-sm text-muted">
          {trail.map((item, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1">
                {index > 0 ? (
                  <Icon name="chevron-right" className="size-4 opacity-60" />
                ) : null}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="inline-flex min-h-11 items-center text-fg"
                  >
                    {item.name}
                  </span>
                ) : (
                  <InternalLink
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-md focus-ring hover:text-fg"
                  >
                    {item.name}
                  </InternalLink>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
