import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import { primaryCta } from "@/content/navigation";
import { siteConfig } from "@/lib/site-config";
import { formatPhone, telHref } from "@/lib/utils";

export interface CtaBannerProps {
  readonly title?: string;
  readonly description?: string;
}

export function CtaBanner({
  title = "Ready to book your car in?",
  description = "Tell us what you drive and what you need. We will confirm a time at our Concord shop, usually the same day.",
}: CtaBannerProps) {
  return (
    <Section id="cta" labelledBy="cta-heading" tone="accent" padding="tight">
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <Heading as="h2" size="md" id="cta-heading" className="text-accent-fg">
            {title}
          </Heading>
          <p className="mt-2 text-lg text-accent-fg/80">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            href={primaryCta.href}
            size="lg"
            className="bg-bg text-fg hover:bg-surface-2"
          >
            {primaryCta.label}
          </Button>
          <Button
            href={telHref(siteConfig.primaryPhone)}
            variant="secondary"
            size="lg"
            icon="phone"
            iconPosition="start"
            className="border-accent-fg/40 text-accent-fg hover:border-accent-fg hover:bg-accent-fg/10"
          >
            {formatPhone(siteConfig.primaryPhone)}
          </Button>
        </div>
      </div>
    </Section>
  );
}
