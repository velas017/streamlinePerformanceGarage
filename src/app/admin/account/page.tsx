import {
  changeAccountPassword,
  createAccountBackupCodes,
  signOutAllDevices,
} from "@/app/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPage, AdminPanel } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/Button";
import { adminForms, adminHelp } from "@/content/admin";
import { adminMetadata, formatActivityTime } from "@/lib/admin/format";
import { adminRequest } from "@/lib/admin/request";
import { requireSession } from "@/lib/admin/session";
import { auditEventLabels, readAudit, readUser } from "@/lib/admin/store";

export const metadata = adminMetadata("Account");

const ACTIVITY_SHOWN = 15;
const ACTIVITY_READ = 100;

export default async function AccountPage() {
  await adminRequest();
  const session = await requireSession();
  const [user, audit] = await Promise.all([
    readUser(session.email),
    readAudit(ACTIVITY_READ),
  ]);
  const activity = audit
    .filter((entry) => entry.email === session.email)
    .slice(0, ACTIVITY_SHOWN);
  const codesLeft = user.backupCodes.length;

  return (
    <AdminPage
      width="wide"
      eyebrow="Staff only"
      title="Your account"
      nav={<AdminNav email={session.email} />}
    >
      <AdminPanel
        id="password"
        title="Change password"
        description="Your other devices are signed out when you change it."
      >
        <AdminForm action={changeAccountPassword} content={adminForms.changePassword} />
      </AdminPanel>

      <AdminPanel
        id="backup-codes"
        title="Backup codes"
        description={`${adminHelp.backupCodes} You have ${codesLeft} unused ${codesLeft === 1 ? "code" : "codes"}. Creating new ones cancels the old ones.`}
      >
        <AdminForm
          action={createAccountBackupCodes}
          content={adminForms.backupCodes}
          variant="secondary"
        />
      </AdminPanel>

      <AdminPanel
        id="devices"
        title="Sign out everywhere"
        description={adminHelp.signOutEverywhere}
      >
        <form action={signOutAllDevices}>
          <Button type="submit" variant="secondary">
            Sign out of all devices
          </Button>
        </form>
      </AdminPanel>

      <AdminPanel
        id="activity"
        title="Recent activity"
        description="If something here was not you, change your password and sign out everywhere."
      >
        {activity.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border text-sm">
            {activity.map((entry) => (
              <li
                key={`${entry.at}-${entry.type}`}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4"
              >
                <span className="text-fg">{auditEventLabels[entry.type]}</span>
                <time dateTime={entry.at} className="text-muted">
                  {formatActivityTime(entry.at)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nothing yet.</p>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
