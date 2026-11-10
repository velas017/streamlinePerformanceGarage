import { redirect } from "next/navigation";
import { resendSignInCode, verifyBackupCode, verifyCode } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminPage } from "@/components/admin/AdminPage";
import { Notice } from "@/components/admin/Notice";
import { InternalLink } from "@/components/ui/Link";
import { adminForms, adminHelp, adminMessages } from "@/content/admin";
import { pendingSignIn } from "@/lib/admin/auth";
import { isAdminConfigured } from "@/lib/admin/config";
import { adminMetadata, maskEmail } from "@/lib/admin/format";
import { adminRequest } from "@/lib/admin/request";
import { getChallengeToken, getSession } from "@/lib/admin/session";

export const metadata = adminMetadata("Enter your code");

export default async function VerifyPage({
  searchParams,
}: PageProps<"/admin/sign-in/verify">) {
  await adminRequest();
  if (await getSession()) redirect("/admin");
  const token = await getChallengeToken();
  const pending = token && isAdminConfigured() ? await pendingSignIn(token) : null;
  if (!pending) redirect("/admin/sign-in?notice=expired");
  const unsent = (await searchParams).sent === "no";

  return (
    <AdminPage
      eyebrow="Step 2 of 2"
      title="Enter your code"
      lead={
        unsent
          ? undefined
          : `We emailed a code to ${maskEmail(pending.email)}. Enter it here.`
      }
    >
      {unsent ? <Notice>{adminMessages.codeUnsent}</Notice> : null}
      <AdminForm action={verifyCode} content={adminForms.verifyCode} />
      <p className="text-sm text-muted">{adminHelp.verify}</p>
      <AdminForm
        action={resendSignInCode}
        content={adminForms.resendCode}
        variant="secondary"
      />
      {/* Open already when the email failed: the backup code is then the way in. */}
      <details open={unsent} className="rounded-md border border-border">
        <summary className="flex min-h-11 cursor-pointer items-center px-4 font-medium text-fg focus-ring">
          Email not arriving? Use a backup code
        </summary>
        <div className="border-t border-border p-4">
          <AdminForm
            action={verifyBackupCode}
            content={adminForms.backupCode}
            variant="secondary"
          />
        </div>
      </details>
      <p className="text-sm text-muted">
        <InternalLink
          href={"/admin/sign-in"}
          className="font-semibold text-accent underline underline-offset-4 focus-ring"
        >
          Start again with a different email
        </InternalLink>
      </p>
    </AdminPage>
  );
}
