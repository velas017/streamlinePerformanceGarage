import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPage, AdminPanel } from "@/components/admin/AdminPage";
import { Notice } from "@/components/admin/Notice";
import { InternalLink } from "@/components/ui/Link";
import { adminHelp, adminSections } from "@/content/admin";
import { adminMetadata } from "@/lib/admin/format";
import { adminRequest } from "@/lib/admin/request";
import { requireSession } from "@/lib/admin/session";
import { readUser } from "@/lib/admin/store";

export const metadata = adminMetadata("Home");

const linkClasses = "font-semibold text-accent underline underline-offset-4 focus-ring";

export default async function AdminHomePage() {
  await adminRequest();
  const session = await requireSession();
  const user = await readUser(session.email);

  return (
    <AdminPage
      width="wide"
      eyebrow="Staff only"
      title="Shop admin"
      lead="Everything you can manage on the website yourself."
      nav={<AdminNav email={session.email} />}
    >
      {user.backupCodes.length === 0 ? (
        <Notice>
          You have no backup codes. {adminHelp.backupCodes}{" "}
          <InternalLink href={"/admin/account"} className={linkClasses}>
            Create backup codes
          </InternalLink>
        </Notice>
      ) : null}
      <ul className="grid gap-4 sm:grid-cols-2">
        {adminSections.map((section) => (
          <li key={section.id}>
            <AdminPanel
              id={section.id}
              title={section.title}
              description={section.description}
            >
              {section.route && section.linkLabel ? (
                <InternalLink href={section.route} className={linkClasses}>
                  {section.linkLabel}
                </InternalLink>
              ) : (
                <p className="text-sm font-semibold text-muted">Coming soon</p>
              )}
            </AdminPanel>
          </li>
        ))}
      </ul>
    </AdminPage>
  );
}
