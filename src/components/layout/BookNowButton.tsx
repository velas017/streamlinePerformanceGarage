import { Button, type ButtonLinkProps } from "@/components/ui/Button";
import { primaryCta } from "@/content/navigation";
import { cn } from "@/lib/utils";

export type BookNowButtonProps = Omit<ButtonLinkProps, "href" | "children">;

/**
 * The site's primary call to action. The label lives in content/navigation.ts;
 * it is rendered in caps here so the accessible name stays "Book now" while the
 * button reads BOOK NOW, as the client asked.
 */
export function BookNowButton({ className, ...rest }: BookNowButtonProps) {
  return (
    <Button
      href={primaryCta.href}
      className={cn("tracking-wide uppercase", className)}
      {...rest}
    >
      {primaryCta.label}
    </Button>
  );
}
