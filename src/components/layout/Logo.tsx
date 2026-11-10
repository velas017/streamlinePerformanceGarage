import Image from "next/image";
import { InternalLink } from "@/components/ui/Link";
import { images } from "@/content/images";
import type { AppHref } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Brand lockup: the shop's mark (white derivative for the dark theme) plus the
 * two-line wordmark. The visible text is the link's accessible name, so the
 * image is decorative.
 */
export interface LogoProps {
  readonly className?: string;
  /** Where the lockup links; the admin area points it at its own home. */
  readonly href?: AppHref;
}

export function Logo({ className, href = "/" }: LogoProps) {
  const mark = images.logoMarkWhite;
  return (
    <InternalLink
      href={href}
      className={cn("flex min-h-11 items-center gap-3 rounded-md focus-ring", className)}
    >
      <Image
        src={mark.src}
        alt=""
        width={mark.width}
        height={mark.height}
        sizes="64px"
        className="h-8 w-auto lg:h-10"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-bold tracking-[0.12em] text-fg uppercase">
          {siteConfig.wordmark.primary}
        </span>
        <span className="font-sans text-[0.6rem] font-semibold tracking-[0.28em] text-accent uppercase">
          {siteConfig.wordmark.secondary}
        </span>
      </span>
    </InternalLink>
  );
}
