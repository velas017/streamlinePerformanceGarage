import { signOut } from "@/app/admin/actions";
import { ActiveLink } from "@/components/layout/ActiveLink";
import { Button } from "@/components/ui/Button";
import { adminNavigation } from "@/content/admin";

/** Signed-in navigation: the admin sections, who is signed in, and Sign out. */
export function AdminNav({ email }: { readonly email: string }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Admin">
        <ul className="flex items-center gap-1">
          {adminNavigation.map((item) => (
            <li key={item.route}>
              <ActiveLink
                href={item.route}
                className="flex min-h-11 items-center rounded-md px-3 font-medium text-muted focus-ring hover:bg-surface-2 hover:text-fg"
                activeClassName="text-fg underline underline-offset-8"
              >
                {item.label}
              </ActiveLink>
            </li>
          ))}
        </ul>
      </nav>
      <form action={signOut} className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-sm break-all text-muted">Signed in as {email}</p>
        <Button type="submit" variant="secondary" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}
