import { JsonLd } from "@/components/seo/JsonLd";
import { FaqList } from "@/components/ui/FaqList";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Faq } from "@/content/types";
import { visibility } from "@/content/visibility";
import { faqSchema } from "@/lib/seo";

export interface FaqSectionProps {
  readonly faqs: readonly Faq[];
  readonly title?: string;
  readonly eyebrow?: string;
}

/**
 * FAQ accordion with matching FAQPage JSON-LD; schema only covers visible
 * questions. Renders nothing while FAQs are hidden (content/visibility.ts), so
 * every page that shows FAQs follows that one switch.
 */
export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  eyebrow = "Good to know",
}: FaqSectionProps) {
  if (!visibility.faqs || faqs.length === 0) return null;
  return (
    <Section id="faq" labelledBy="faq-heading" containerSize="prose">
      <JsonLd data={faqSchema(faqs)} />
      <SectionHeader id="faq-heading" eyebrow={eyebrow} title={title} />
      <FaqList items={faqs} />
    </Section>
  );
}
