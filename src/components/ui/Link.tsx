import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import type { AppHref, DynamicHref } from "@/lib/routes";

export interface InternalLinkProps extends Omit<ComponentPropsWithoutRef<"a">, "href"> {
  readonly href: AppHref;
  readonly prefetch?: boolean | null;
}

/**
 * The one wrapper around next/link. Its href is typed as AppHref so every internal
 * link is validated at typecheck time; the explicit generic keeps dynamic hrefs
 * (services/[slug], locations/[slug]) accepted by typedRoutes.
 */
export function InternalLink({ href, ...rest }: InternalLinkProps) {
  return <NextLink<DynamicHref> href={href} {...rest} />;
}

const EXTERNAL_PATTERN = /^(https?:|tel:|mailto:|sms:)/i;

export function isExternalHref(href: string): boolean {
  return EXTERNAL_PATTERN.test(href);
}
