import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { makes } from "@/content/makes";

export function MakesSection() {
  return (
    <Section id="makes" labelledBy="makes-heading" tone="surface">
      <SectionHeader
        id="makes-heading"
        eyebrow="Platforms we specialize in"
        title="Built around Japanese performance"
        description="We work on these makes every day, which means the right tools, the right parts relationships and the platform knowledge that keeps your car reliable."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {makes.map((entry) => (
          <li key={entry.make} className="flex">
            <Card className="w-full">
              <h3 className="text-display-sm">{entry.make}</h3>
              <ul
                className="flex flex-wrap gap-2"
                aria-label={`${entry.make} models we service`}
              >
                {entry.models.map((model) => (
                  <li
                    key={model}
                    className="rounded-full border border-border-strong px-3 py-1 text-sm text-fg"
                  >
                    {model}
                  </li>
                ))}
              </ul>
              <p className="text-muted">{entry.blurb}</p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
