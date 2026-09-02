import type { Faq } from "@/content/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface FaqListProps {
  readonly items: readonly Faq[];
  readonly className?: string;
}

/**
 * Native <details>/<summary> accordion: keyboard operable, no JS, announced
 * correctly by screen readers. Pair with the FAQPage JSON-LD builder.
 */
export function FaqList({ items, className }: FaqListProps) {
  return (
    <div
      className={cn(
        "divide-y divide-border rounded-lg border border-border bg-surface",
        className,
      )}
    >
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-fg focus-ring marker:content-none [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <Icon
              name="chevron-down"
              className="text-muted transition-transform group-open:rotate-180 motion-safe:duration-200"
            />
          </summary>
          <p className="px-5 pb-5 leading-7 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
