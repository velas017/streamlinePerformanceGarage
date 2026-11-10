import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { SkipLink } from "@/components/layout/SkipLink";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

/**
 * Chrome of the private admin area: its own header, the one <main> and a
 * footer, with none of the public site's navigation, calls to action or
 * schema.
 */
export function AdminShell({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <header className="border-b border-border bg-bg">
        <Container className="flex min-h-16 items-center justify-between gap-4">
          <Logo href="/admin" />
          <p className="rounded-md border border-border-strong px-3 py-1 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            Admin
          </p>
        </Container>
      </header>
      {/* Skip-link target: outline removed only here because the landmark itself is the focus destination. */}
      <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
        {children}
      </main>
      <footer className="border-t border-border py-6">
        <Container>
          <p className="text-sm text-muted">
            Private area for {siteConfig.name} staff. Not part of the public website.
          </p>
        </Container>
      </footer>
    </>
  );
}
