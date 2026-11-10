import { setPassword } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminPage } from "@/components/admin/AdminPage";
import { Notice } from "@/components/admin/Notice";
import { InternalLink } from "@/components/ui/Link";
import { adminFieldNames, adminForms, adminMessages } from "@/content/admin";
import { isPasswordLinkValid } from "@/lib/admin/auth";
import { isAdminConfigured } from "@/lib/admin/config";
import { adminMetadata } from "@/lib/admin/format";
import { adminRequest } from "@/lib/admin/request";

export const metadata = adminMetadata("Choose a password");

/**
 * Opened from the emailed link. Viewing the page does not spend the link (mail
 * scanners open links); saving a password does.
 */
export default async function SetPasswordPage({
  searchParams,
}: PageProps<"/admin/set-password">) {
  await adminRequest();
  const { token } = await searchParams;
  const valid =
    typeof token === "string" &&
    isAdminConfigured() &&
    (await isPasswordLinkValid(token));

  return (
    <AdminPage
      eyebrow="Staff only"
      title="Choose a password"
      lead={valid ? "Saving a new password signs you out on every device." : undefined}
    >
      {valid ? (
        <AdminForm
          action={setPassword}
          content={adminForms.setPassword}
          hidden={{ [adminFieldNames.token]: token }}
        />
      ) : (
        <>
          <Notice>{adminMessages.linkExpired}</Notice>
          <p className="text-sm text-muted">
            <InternalLink
              href={"/admin/forgot-password"}
              className="font-semibold text-accent underline underline-offset-4 focus-ring"
            >
              Email me a new link
            </InternalLink>
          </p>
        </>
      )}
    </AdminPage>
  );
}
