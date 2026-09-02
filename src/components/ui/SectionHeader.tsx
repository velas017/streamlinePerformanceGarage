import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading, type HeadingProps } from "@/components/ui/Heading";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  /** Must match the parent Section's `labelledBy`. */
  readonly id: string;
  readonly title: ReactNode;
  readonly eyebrow?: string;
  readonly description?: ReactNode;
  readonly as?: HeadingProps["as"];
  readonly size?: HeadingProps["size"];
  readonly align?: "start" | "center";
  readonly className?: string;
}

export function SectionHeader({
  id,
  title,
  eyebrow,
  description,
  as = "h2",
  size = "lg",
  align = "start",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex max-w-prose flex-col gap-3 sm:mb-14",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading as={as} size={size} id={id}>
        {title}
      </Heading>
      {description ? <p className="text-lead text-muted">{description}</p> : null}
    </div>
  );
}
