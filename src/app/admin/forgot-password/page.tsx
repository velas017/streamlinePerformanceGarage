import { requestLink } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminPage } from "@/components/admin/AdminPage";
import { Notice } from "@/components/admin/Notice";
import { InternalLink } from "@/components/ui/Link";
import { adminForms, adminMessages } from "@/content/admin";
import { isAdminConfigured } from "@/lib/admin/config";
import { adminMetadata } from "@/lib/admin/format";
import { adminRequest } from "@/lib/admin/request";

export const metadata = adminMetadata("Choose a password");

export default async function ForgotPasswordPage() {
  await adminRequest();
  return (
    <AdminPage
      eyebrow="Staff only"
      title="Choose a password"
      lead="For your first sign-in, or if you forgot your password. Enter your email and we will send you a link to choose a new one."
    >
      {isAdminConfigured() ? (
        <AdminForm action={requestLink} content={adminForms.forgotPassword} />
      ) : (
        <Notice>{adminMessages.notSetUp}</Notice>
      )}
      <p className="text-sm text-muted">
        <InternalLink
          href={"/admin/sign-in"}
          className="font-semibold text-accent underline underline-offset-4 focus-ring"
        >
          Back to sign in
        </InternalLink>
      </p>
    </AdminPage>
  );
}
