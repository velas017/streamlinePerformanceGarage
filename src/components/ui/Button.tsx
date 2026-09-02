import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Icon, type IconName } from "@/components/ui/Icon";
import { InternalLink, isExternalHref } from "@/components/ui/Link";
import type { AppHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

const button = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap focus-ring",
    "transition-colors select-none motion-safe:duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-fg text-bg hover:bg-accent",
        secondary:
          "border border-border-strong bg-transparent text-fg hover:border-fg hover:bg-surface-2",
        ghost: "text-fg hover:bg-surface-2",
        link: "h-auto px-0 text-accent underline-offset-4 hover:underline",
      },
      size: {
        // All sizes meet the 44px minimum target height (WCAG 2.5.8 / CLAUDE.md §5).
        sm: "min-h-11 px-4 text-sm",
        md: "min-h-12 px-6 text-base",
        lg: "min-h-14 px-8 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface SharedProps extends VariantProps<typeof button> {
  readonly icon?: IconName;
  readonly iconPosition?: "start" | "end";
  readonly className?: string;
  readonly children: ReactNode;
}

type AnchorLikeProps = SharedProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof SharedProps | "href"> & {
    readonly href: AppHref;
  };

type NativeButtonProps = SharedProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof SharedProps> & {
    readonly href?: undefined;
  };

export type ButtonProps = AnchorLikeProps | NativeButtonProps;

function isAnchor(props: ButtonProps): props is AnchorLikeProps {
  return typeof props.href === "string";
}

/**
 * One button component for every call to action. Renders an internal link for
 * app routes, a plain anchor for external/tel/mailto hrefs, and a <button>
 * when no href is given.
 */
export function Button(props: ButtonProps) {
  const classes = cn(
    button({ variant: props.variant, size: props.size }),
    props.className,
  );
  const iconPosition = props.iconPosition ?? "end";
  const iconEl = props.icon ? <Icon name={props.icon} className="size-[1.1em]" /> : null;
  const content = (
    <>
      {iconPosition === "start" ? iconEl : null}
      {props.children}
      {iconPosition === "end" ? iconEl : null}
    </>
  );

  if (isAnchor(props)) {
    const {
      variant,
      size,
      icon,
      iconPosition,
      className,
      children,
      href,
      ...anchorProps
    } = props;
    if (isExternalHref(href)) {
      return (
        <a href={href} className={classes} {...anchorProps}>
          {content}
        </a>
      );
    }
    return (
      <InternalLink href={href} className={classes} {...anchorProps}>
        {content}
      </InternalLink>
    );
  }

  const {
    variant,
    size,
    icon,
    iconPosition: _pos,
    className,
    children,
    href,
    type = "button",
    ...buttonProps
  } = props;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
