import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

export interface AdminPageProps {
  /** The page's single <h1>. */
  readonly title: string;
  readonly eyebrow?: string;
  readonly lead?: ReactNode;
  /** "narrow" for a single form, "wide" for the signed-in screens. */
  readonly width?: "narrow" | "wide";
  /** Rendered above the title: the signed-in navigation. */
  readonly nav?: ReactNode;
  readonly children: ReactNode;
}

const PAGE_TITLE_ID = "page-title";

/** Body of every admin page: one named section, one h1, a consistent column. */
export function AdminPage({
  title,
  eyebrow,
  lead,
  width = "narrow",
  nav,
  children,
}: AdminPageProps) {
  return (
    <Section labelledBy={PAGE_TITLE_ID} padding="tight">
      <div
        className={cn(
          "mx-auto flex flex-col gap-8",
          width === "narrow" ? "max-w-md" : "max-w-3xl",
        )}
      >
        {nav}
        <div className="flex flex-col gap-3">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <Heading as="h1" size="md" id={PAGE_TITLE_ID}>
            {title}
          </Heading>
          {lead ? <p className="text-muted">{lead}</p> : null}
        </div>
        {children}
      </div>
    </Section>
  );
}

export interface AdminPanelProps {
  /** Unique on the page; names the panel for assistive technology. */
  readonly id: string;
  readonly title: string;
  readonly description?: ReactNode;
  readonly children?: ReactNode;
}

/** One titled block of a signed-in page (an h2 under the page's h1). */
export function AdminPanel({ id, title, description, children }: AdminPanelProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
    >
      <Heading as="h2" size="xs" id={headingId}>
        {title}
      </Heading>
      {description ? <p className="text-sm text-muted">{description}</p> : null}
      {children}
    </section>
  );
}
