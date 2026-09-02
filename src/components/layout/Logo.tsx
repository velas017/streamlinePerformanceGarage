import { InternalLink } from "@/components/ui/Link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Logo({ className }: { readonly className?: string }) {
  return (
    <InternalLink
      href="/"
      className={cn("flex min-h-11 items-center gap-2 rounded-md focus-ring", className)}
    >
      <span aria-hidden="true" className="block h-8 w-4 skew-x-[-20deg] bg-accent" />
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
