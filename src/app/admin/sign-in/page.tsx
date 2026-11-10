import { redirect } from "next/navigation";
import { signIn } from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminPage } from "@/components/admin/AdminPage";
import { Notice } from "@/components/admin/Notice";
import { InternalLink } from "@/components/ui/Link";
import {
  adminForms,
  adminHelp,
  adminMessages,
  signInNotices,
  type SignInNotice,
} from "@/content/admin";
import { isAdminConfigured } from "@/lib/admin/config";
import { adminMetadata } from "@/lib/admin/format";
import { adminRequest } from "@/lib/admin/request";
import { getSession } from "@/lib/admin/session";

export const metadata = adminMetadata("Sign in");

function isNotice(value: unknown): value is SignInNotice {
  return typeof value === "string" && Object.hasOwn(signInNotices, value);
}

export default async function SignInPage({ searchParams }: PageProps<"/admin/sign-in">) {
  await adminRequest();
  if (await getSession()) redirect("/admin");
  const { notice } = await searchParams;

  return (
    <AdminPage eyebrow="Staff only" title="Sign in" lead={adminHelp.signIn}>
      {isNotice(notice) ? <Notice>{signInNotices[notice]}</Notice> : null}
      {isAdminConfigured() ? (
        <>
          <AdminForm action={signIn} content={adminForms.signIn} />
          <p className="text-sm text-muted">
            <InternalLink
              href={"/admin/forgot-password"}
              className="font-semibold text-accent underline underline-offset-4 focus-ring"
            >
              First time here, or forgot your password?
            </InternalLink>
          </p>
        </>
      ) : (
        <Notice>{adminMessages.notSetUp}</Notice>
      )}
    </AdminPage>
  );
}
