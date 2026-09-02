"use client";

import { usePathname } from "next/navigation";
import { InternalLink, type InternalLinkProps } from "@/components/ui/Link";
import { cn } from "@/lib/utils";

export interface ActiveLinkProps extends InternalLinkProps {
  readonly activeClassName?: string;
  /** Match child routes too (e.g. /services/* highlights "Services"). */
  readonly partial?: boolean;
}

/** Nav link that sets aria-current="page" on the active route. */
export function ActiveLink({
  href,
  className,
  activeClassName,
  partial = false,
  ...rest
}: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (partial && href !== "/" && pathname.startsWith(`${href}/`));
  return (
    <InternalLink
      href={href}
      className={cn(className, isActive && activeClassName)}
      {...(isActive ? { "aria-current": "page" as const } : {})}
      {...rest}
    />
  );
}
