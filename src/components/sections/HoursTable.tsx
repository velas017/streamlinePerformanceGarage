import type { OpeningHours } from "@/lib/site-config";
import { cn, formatOpeningHours } from "@/lib/utils";

export interface HoursTableProps {
  readonly hours: readonly OpeningHours[];
  readonly compact?: boolean;
  readonly className?: string;
}

/** Opening hours as a description list so day/time pairs stay associated. */
export function HoursTable({ hours, compact = false, className }: HoursTableProps) {
  const rows = formatOpeningHours(hours);
  return (
    <dl
      className={cn(
        "grid grid-cols-[auto_1fr] gap-x-6 gap-y-1",
        compact ? "text-sm" : "text-base",
        className,
      )}
    >
      {rows.map((row) => (
        <div key={row.days} className="contents">
          <dt className="text-muted">{row.days}</dt>
          <dd className={cn("text-fg", row.time === "Closed" && "text-muted")}>
            {row.time}
          </dd>
        </div>
      ))}
    </dl>
  );
}
