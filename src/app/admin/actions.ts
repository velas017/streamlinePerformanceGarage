"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminFieldNames as field, adminMessages } from "@/content/admin";
import {
  beginSignIn,
  changePassword,
  completeSignIn,
  createBackupCodes,
  emailSchema,
  newPasswordSchema,
  recordSignOut,
  requestPasswordLink,
  resendCode,
  setPasswordFromLink,
  signOutEverywhere,
  type RequestOrigin,
} from "@/lib/admin/auth";
import { isAdminConfigured } from "@/lib/admin/config";
import { EMAIL_CODE_LENGTH } from "@/lib/admin/crypto";
import type { AdminFormState } from "@/lib/admin/form-state";
import { adminRequest } from "@/lib/admin/request";
import type { AdminRoute } from "@/lib/admin/routes";
import {
  clearChallengeCookie,
  endSession,
  getChallengeToken,
  getSession,
  setChallengeCookie,
  startSession,
  type AdminSession,
} from "@/lib/admin/session";

/**
 * Every server action of the admin area. Each one checks the host, that the
 * area is configured and (where it needs one) the session by itself: an action
 * can be called without ever loading the page it belongs to.
 */

type Outcome = AdminFormState | { readonly redirectTo: AdminRoute };
type ErrorDetails = Omit<
  Extract<AdminFormState, { status: "error" }>,
  "status" | "message"
>;

const signInRoute: AdminRoute = "/admin/sign-in";
const expiredRoute: AdminRoute = "/admin/sign-in?notice=expired";

function fail(message: string, details: ErrorDetails = {}): AdminFormState {
  return { status: "error", message, ...details };
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** The first message per field, keyed by the field's form name. */
function invalid(error: z.ZodError, values?: Record<string, string>): AdminFormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const name = issue.path[0];
    if (typeof name === "string" && !(name in fieldErrors))
      fieldErrors[name] = issue.message;
  }
  return fail(adminMessages.fixFields, { fieldErrors, values });
}

/**
 * Shared frame of every form action. Redirects happen outside the try block
 * (redirect() works by throwing), and a failure in the store or the mailer
 * becomes a plain message instead of an error page.
 */
async function run(
  work: (origin: RequestOrigin) => Promise<Outcome>,
): Promise<AdminFormState> {
  const origin = await adminRequest();
  if (!isAdminConfigured()) return fail(adminMessages.notSetUp);
  let outcome: Outcome;
  try {
    outcome = await work(origin);
  } catch (error) {
    console.error("[admin] action failed:", error);
    return fail(adminMessages.unavailable);
  }
  if ("redirectTo" in outcome) redirect(outcome.redirectTo);
  return outcome;
}

/** `run` for actions that need a signed-in admin; anyone else is sent to sign in. */
function runSignedIn(
  work: (session: AdminSession, origin: RequestOrigin) => Promise<Outcome>,
): Promise<AdminFormState> {
  return run(async (origin) => {
    const session = await getSession();
    return session ? work(session, origin) : { redirectTo: signInRoute };
  });
}

/* --------------------------------- Signing in ------------------------------ */

const signInSchema = z.object({
  [field.email]: emailSchema,
  [field.password]: z.string().min(1, "Enter your password").max(200),
});

/** Step 1: email and password. On success the code is emailed and step 2 opens. */
export async function signIn(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const email = text(formData, field.email);
  const values = { [field.email]: email };
  return run(async (origin) => {
    const parsed = signInSchema.safeParse({
      [field.email]: email,
      [field.password]: text(formData, field.password),
    });
    if (!parsed.success) return invalid(parsed.error, values);
    const result = await beginSignIn(parsed.data, origin);
    if (!result.ok) {
      return fail(
        result.reason === "locked"
          ? adminMessages.locked
          : adminMessages.wrongCredentials,
        { values },
      );
    }
    await setChallengeCookie(result.challengeToken);
    return {
      redirectTo: result.emailSent
        ? "/admin/sign-in/verify"
        : "/admin/sign-in/verify?sent=no",
    };
  });
}

function finishSignIn(
  kind: "email" | "backup",
  name: string,
  code: string,
  wrongMessage: string,
): Promise<AdminFormState> {
  return run(async (origin) => {
    const challengeToken = await getChallengeToken();
    if (!challengeToken) return { redirectTo: expiredRoute };
    const result = await completeSignIn({ challengeToken, code, kind }, origin);
    if (result.ok) {
      await startSession(result.sessionToken);
      return { redirectTo: "/admin" };
    }
    if (result.reason === "expired") {
      await clearChallengeCookie();
      return { redirectTo: expiredRoute };
    }
    return fail(wrongMessage, { fieldErrors: { [name]: wrongMessage } });
  });
}

/** Step 2 with the emailed code. A code of the wrong shape does not use up a try. */
export async function verifyCode(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const code = text(formData, field.code).replace(/\s/g, "");
  if (!new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`).test(code)) {
    return fail(adminMessages.fixFields, {
      fieldErrors: {
        [field.code]: `Enter the ${EMAIL_CODE_LENGTH} digits from the email`,
      },
    });
  }
  return finishSignIn("email", field.code, code, adminMessages.wrongCode);
}

/** Step 2 with a backup code, for when the email does not arrive. */
export async function verifyBackupCode(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const code = text(formData, field.backupCode).trim();
  if (code === "") {
    return fail(adminMessages.fixFields, {
      fieldErrors: { [field.backupCode]: "Enter one of your backup codes" },
    });
  }
  return finishSignIn("backup", field.backupCode, code, adminMessages.wrongBackupCode);
}

export async function resendSignInCode(
  _previous: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  return run(async () => {
    const challengeToken = await getChallengeToken();
    if (!challengeToken) return { redirectTo: expiredRoute };
    const result = await resendCode(challengeToken);
    if (result.ok) return { status: "success", message: adminMessages.codeSent };
    switch (result.reason) {
      case "expired":
        await clearChallengeCookie();
        return { redirectTo: expiredRoute };
      case "limit":
        return fail(adminMessages.codeLimit);
      case "unsent":
        return fail(adminMessages.codeUnsent);
      default:
        return result.reason satisfies never;
    }
  });
}

/* -------------------------------- Password links --------------------------- */

const requestLinkSchema = z.object({ [field.email]: emailSchema });

/** Emails a link to choose a password. Says the same thing for every email. */
export async function requestLink(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const email = text(formData, field.email);
  return run(async (origin) => {
    const parsed = requestLinkSchema.safeParse({ [field.email]: email });
    if (!parsed.success) return invalid(parsed.error, { [field.email]: email });
    return (await requestPasswordLink(parsed.data[field.email], origin))
      ? { status: "success", message: adminMessages.linkRequested }
      : fail(adminMessages.tooManyRequests);
  });
}

const newPasswordShape = {
  [field.newPassword]: newPasswordSchema,
  [field.confirmPassword]: z.string(),
};

function passwordsMatch(input: Record<string, string>): boolean {
  return input[field.newPassword] === input[field.confirmPassword];
}
const mismatch = {
  message: adminMessages.passwordMismatch,
  path: [field.confirmPassword],
};

function newPasswordInput(formData: FormData) {
  return {
    [field.newPassword]: text(formData, field.newPassword),
    [field.confirmPassword]: text(formData, field.confirmPassword),
  };
}

const setPasswordSchema = z.object(newPasswordShape).refine(passwordsMatch, mismatch);

/** Sets the password from an emailed link, then sends the person to sign in with it. */
export async function setPassword(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  return run(async (origin) => {
    const parsed = setPasswordSchema.safeParse(newPasswordInput(formData));
    if (!parsed.success) return invalid(parsed.error);
    const saved = await setPasswordFromLink(
      { token: text(formData, field.token), password: parsed.data[field.newPassword] },
      origin,
    );
    return saved
      ? { redirectTo: "/admin/sign-in?notice=password-set" }
      : fail(adminMessages.linkExpired);
  });
}

/* ------------------------------- Signed-in actions ------------------------- */

const changePasswordSchema = z
  .object({
    [field.currentPassword]: z.string().min(1, "Enter your current password").max(200),
    ...newPasswordShape,
  })
  .refine(passwordsMatch, mismatch);

export async function changeAccountPassword(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  return runSignedIn(async (session, origin) => {
    const parsed = changePasswordSchema.safeParse({
      [field.currentPassword]: text(formData, field.currentPassword),
      ...newPasswordInput(formData),
    });
    if (!parsed.success) return invalid(parsed.error);
    const result = await changePassword(
      {
        email: session.email,
        currentPassword: parsed.data[field.currentPassword],
        newPassword: parsed.data[field.newPassword],
        sessionToken: session.token,
      },
      origin,
    );
    switch (result) {
      case "ok":
        // Re-render the page behind the form: the activity list has a new entry.
        refresh();
        return { status: "success", message: adminMessages.passwordChanged };
      case "locked":
        return fail(adminMessages.locked);
      case "invalid":
        return fail(adminMessages.fixFields, {
          fieldErrors: { [field.currentPassword]: adminMessages.wrongCurrentPassword },
        });
      default:
        return result satisfies never;
    }
  });
}

/** Replaces the backup codes and shows the new ones once. */
export async function createAccountBackupCodes(
  _previous: AdminFormState,
  _formData: FormData,
): Promise<AdminFormState> {
  return runSignedIn(async (session, origin) => {
    const codes = await createBackupCodes(session.email, origin);
    // Re-render the page behind the form so "unused codes" shows the new count.
    refresh();
    return { status: "success", message: adminMessages.backupCodesCreated, codes };
  });
}

/** Sign out button: ends this device's session. */
export async function signOut(): Promise<void> {
  const origin = await adminRequest();
  const session = await getSession();
  if (session) {
    await recordSignOut(session.email, origin);
    await endSession(session);
  }
  redirect(signInRoute);
}

/** Ends every session of the account, this one included. */
export async function signOutAllDevices(): Promise<void> {
  const origin = await adminRequest();
  const session = await getSession();
  if (session) {
    await signOutEverywhere(session.email, origin);
    await endSession(session);
  }
  redirect(session ? "/admin/sign-in?notice=signed-out" : "/admin/sign-in");
}
