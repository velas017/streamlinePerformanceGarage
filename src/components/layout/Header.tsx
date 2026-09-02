import { ActiveLink } from "@/components/layout/ActiveLink";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { mainNavigation, primaryCta } from "@/content/navigation";
import { siteConfig } from "@/lib/site-config";
import { formatPhone, telHref } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <Container className="flex min-h-16 items-center justify-between gap-4 lg:min-h-20">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <ActiveLink
                  href={item.href}
                  partial
                  className="flex min-h-11 items-center rounded-md px-3 font-medium text-muted focus-ring hover:bg-surface-2 hover:text-fg"
                  activeClassName="text-fg"
                >
                  {item.label}
                </ActiveLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            href={telHref(siteConfig.primaryPhone)}
            variant="ghost"
            size="sm"
            icon="phone"
            iconPosition="start"
            className="hidden md:inline-flex"
          >
            {formatPhone(siteConfig.primaryPhone)}
          </Button>
          <Button href={primaryCta.href} size="sm" className="hidden sm:inline-flex">
            {primaryCta.label}
          </Button>
          <MobileNav
            items={mainNavigation}
            cta={primaryCta}
            phone={siteConfig.primaryPhone}
          />
        </div>
      </Container>
    </header>
  );
}
