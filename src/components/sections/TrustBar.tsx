import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { trustPoints } from "@/content/trust";

export function TrustBar() {
  return (
    <section
      aria-label="Why customers trust us"
      className="border-y border-border bg-surface"
    >
      <Container>
        <ul className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {trustPoints.map((point) => (
            <li
              key={point.label}
              className="flex items-start gap-4 px-0 py-5 sm:px-5 lg:py-6"
            >
              <Icon name={point.icon} className="mt-0.5 size-6 text-accent" />
              <div>
                <p className="font-semibold text-fg">{point.label}</p>
                <p className="text-sm text-muted">{point.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
