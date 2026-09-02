"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ActiveLink } from "@/components/layout/ActiveLink";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { NavItem, NavLink } from "@/content/navigation";
import { formatPhone, telHref } from "@/lib/utils";

export interface MobileNavProps {
  readonly items: readonly NavItem[];
  readonly cta: NavLink;
  readonly phone: string;
}

const linkClasses =
  "focus-ring flex min-h-12 items-center rounded-md px-3 text-lg font-semibold text-fg hover:bg-surface-2";
const childLinkClasses =
  "focus-ring flex min-h-11 items-center rounded-md px-3 text-base text-muted hover:bg-surface-2 hover:text-fg";

/**
 * Mobile menu built on the native <dialog> element: the browser provides the
 * focus trap, Escape-to-close and focus return to the trigger. We only sync
 * React state with the dialog and close it on navigation.
 */
export function MobileNav({ items, cta, phone }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const pathname = usePathname();

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Close when the route changes (link clicked or back button). This is React's
  // "adjust state during render" pattern rather than a setState-in-effect.
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-md text-fg focus-ring hover:bg-surface-2 lg:hidden"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" className="size-6" />
        <span className="sr-only">Open menu</span>
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="Site navigation"
        onClose={() => setOpen(false)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-fg backdrop:bg-black/70 open:flex open:flex-col"
      >
        <div className="flex min-h-16 items-center justify-between border-b border-border px-4">
          <span className="font-display text-lg font-bold tracking-widest uppercase">
            Menu
          </span>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md focus-ring hover:bg-surface-2"
            onClick={close}
          >
            <Icon name="close" className="size-6" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <ActiveLink
                  href={item.href}
                  partial
                  className={linkClasses}
                  activeClassName="text-accent"
                >
                  {item.label}
                </ActiveLink>
                {item.children ? (
                  <ul className="mt-1 mb-3 ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <ActiveLink
                          href={child.href}
                          className={childLinkClasses}
                          activeClassName="text-accent"
                        >
                          {child.label}
                        </ActiveLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 border-t border-border p-4">
          <Button href={cta.href} size="lg">
            {cta.label}
          </Button>
          <Button
            href={telHref(phone)}
            variant="secondary"
            size="lg"
            icon="phone"
            iconPosition="start"
          >
            Call {formatPhone(phone)}
          </Button>
        </div>
      </dialog>
    </>
  );
}
