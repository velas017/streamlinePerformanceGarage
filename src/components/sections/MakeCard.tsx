import { Card } from "@/components/ui/Card";
import type { MakeSpecialty } from "@/content/makes";
import { cn } from "@/lib/utils";

export interface MakeCardProps {
  readonly entry: MakeSpecialty;
  readonly className?: string;
}

/** One make we specialize in, with the models we see most. */
export function MakeCard({ entry, className }: MakeCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <h3 className="text-display-sm">{entry.make}</h3>
      <ul className="flex flex-wrap gap-2" aria-label={`${entry.make} models we service`}>
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
  );
}
