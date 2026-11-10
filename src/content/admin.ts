import {
  BACKUP_CODE_COUNT,
  CODE_ATTEMPT_LIMIT,
  LOCKOUT_SECONDS,
  PASSWORD_ATTEMPT_LIMIT,
  PASSWORD_MIN_LENGTH,
} from "@/lib/admin/auth";
import { EMAIL_CODE_LENGTH } from "@/lib/admin/crypto";
import type { AdminRoute } from "@/lib/admin/routes";
import { CHALLENGE_TTL_SECONDS, SESSION_TTL_SECONDS } from "@/lib/admin/store";

/**
 * Copy and structure of the private admin area (src/app/admin). Numbers in
 * the text come from the rules in lib/admin, so the page can never promise
 * something the code does not do.
 */

const lockoutMinutes = LOCKOUT_SECONDS / 60;
const codeMinutes = CHALLENGE_TTL_SECONDS / 60;
const sessionDays = SESSION_TTL_SECONDS / (24 * 60 * 60);

/* --------------------------------- Navigation ------------------------------ */

export interface AdminNavLink {
  readonly label: string;
  readonly route: AdminRoute;
}

export const adminNavigation: readonly AdminNavLink[] = [
  { label: "Home", route: "/admin" },
  { label: "Account", route: "/admin/account" },
];

/** The home screen's cards. A section without a route is not built yet. */
export interface AdminSection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly route?: AdminRoute;
  /** Link text, meaningful on its own. */
  readonly linkLabel?: string;
}

export const adminSections: readonly AdminSection[] = [
  {
    id: "photos",
    title: "Photos",
    description: "Add photos to the gallery, describe them and remove old ones.",
  },
  {
    id: "keys",
    title: "Keys and status",
    description:
      "See whether Instagram, booking emails and Google reviews are working, and replace a key that has expired.",
  },
  {
    id: "account",
    title: "Your account",
    description: "Change your password, get backup codes or sign out of every device.",
    route: "/admin/account",
    linkLabel: "Open your account",
  },
];

/* ----------------------------------- Forms --------------------------------- */

export interface AdminFormField {
  /** The input's `name`; server actions read the same constant. */
  readonly name: string;
  readonly label: string;
  readonly type: "email" | "password" | "text";
  readonly autoComplete: string;
  readonly inputMode?: "email" | "numeric" | "text";
  readonly hint?: string;
  readonly maxLength?: number;
}

export interface AdminFormContent {
  readonly fields: readonly AdminFormField[];
  readonly submitLabel: string;
  readonly pendingLabel: string;
}

/** Field names, shared by the forms below and the actions that read them. */
export const adminFieldNames = {
  email: "email",
  password: "password",
  code: "code",
  backupCode: "backupCode",
  token: "token",
  currentPassword: "currentPassword",
  newPassword: "newPassword",
  confirmPassword: "confirmPassword",
} as const;

const newPasswordFields: readonly AdminFormField[] = [
  {
    name: adminFieldNames.newPassword,
    label: "New password",
    type: "password",
    autoComplete: "new-password",
    hint: `At least ${PASSWORD_MIN_LENGTH} characters. A few unrelated words work well.`,
  },
  {
    name: adminFieldNames.confirmPassword,
    label: "New password again",
    type: "password",
    autoComplete: "new-password",
  },
];

const emailField: AdminFormField = {
  name: adminFieldNames.email,
  label: "Email",
  type: "email",
  autoComplete: "username",
  inputMode: "email",
};

export const adminForms = {
  signIn: {
    fields: [
      emailField,
      {
        name: adminFieldNames.password,
        label: "Password",
        type: "password",
        autoComplete: "current-password",
      },
    ],
    submitLabel: "Continue",
    pendingLabel: "Checking…",
  },
  verifyCode: {
    fields: [
      {
        name: adminFieldNames.code,
        label: `${EMAIL_CODE_LENGTH}-digit code`,
        type: "text",
        autoComplete: "one-time-code",
        inputMode: "numeric",
        maxLength: EMAIL_CODE_LENGTH + 2,
        hint: `It expires ${codeMinutes} minutes after it was sent.`,
      },
    ],
    submitLabel: "Sign in",
    pendingLabel: "Signing in…",
  },
  resendCode: {
    fields: [],
    submitLabel: "Email me a new code",
    pendingLabel: "Sending…",
  },
  backupCode: {
    fields: [
      {
        name: adminFieldNames.backupCode,
        label: "Backup code",
        type: "text",
        autoComplete: "off",
        hint: "One of the codes you saved from your account page. Each works once.",
        maxLength: 24,
      },
    ],
    submitLabel: "Sign in with a backup code",
    pendingLabel: "Signing in…",
  },
  forgotPassword: {
    fields: [emailField],
    submitLabel: "Email me a link",
    pendingLabel: "Sending…",
  },
  setPassword: {
    fields: newPasswordFields,
    submitLabel: "Save password",
    pendingLabel: "Saving…",
  },
  changePassword: {
    fields: [
      {
        name: adminFieldNames.currentPassword,
        label: "Current password",
        type: "password",
        autoComplete: "current-password",
      },
      ...newPasswordFields,
    ],
    submitLabel: "Change password",
    pendingLabel: "Saving…",
  },
  backupCodes: {
    fields: [],
    submitLabel: "Create new backup codes",
    pendingLabel: "Creating…",
  },
} as const satisfies Record<string, AdminFormContent>;

/* ---------------------------------- Messages -------------------------------- */

/** One-line notices the sign-in page shows after a redirect (`?notice=`). */
export const signInNotices = {
  expired: "That sign-in ran out of time or tries. Please start again.",
  "password-set": "Your password is saved. Sign in with it now.",
  "signed-out": "You are signed out of every device.",
} as const;
export type SignInNotice = keyof typeof signInNotices;

export const adminMessages = {
  notSetUp:
    "The admin area is not set up yet. Ask whoever looks after the website to finish the setup.",
  unavailable: "Something went wrong on our side. Please try again in a minute.",
  fixFields: "Please fix the highlighted fields.",
  wrongCredentials: "That email and password do not match.",
  locked: `Too many wrong passwords. Sign-in is paused for ${lockoutMinutes} minutes.`,
  wrongCode: "That code is not right. Check the newest email and try again.",
  wrongBackupCode: "That backup code is not right, or it was already used.",
  codeSent: "A new code is on its way. Earlier codes no longer work.",
  codeLimit: "No more codes can be sent for this sign-in. Start again to get a new one.",
  codeUnsent:
    "We could not send the email. Try again in a minute, or use a backup code below.",
  linkRequested:
    "If that email can sign in here, a link is on its way. It works once and expires in an hour.",
  tooManyRequests: "Too many requests. Please try again in an hour.",
  linkExpired: "This link has expired or was already used. Ask for a new one.",
  passwordMismatch: "The two passwords do not match.",
  wrongCurrentPassword: "That is not your current password.",
  passwordChanged: "Password changed. Your other devices have been signed out.",
  backupCodesCreated:
    "Save these codes somewhere safe, such as a printed page in the office. They will not be shown again, and any older codes have stopped working.",
} as const;

/** Short explanations shown beside the forms. */
export const adminHelp = {
  signIn: `After your password we email you a ${EMAIL_CODE_LENGTH}-digit code. ${PASSWORD_ATTEMPT_LIMIT} wrong passwords pause sign-in for ${lockoutMinutes} minutes.`,
  verify: `You have ${CODE_ATTEMPT_LIMIT} tries. You stay signed in on this device for ${sessionDays} days.`,
  backupCodes: `Backup codes let you sign in when the emailed code does not arrive. You get ${BACKUP_CODE_COUNT}; each works once.`,
  signOutEverywhere:
    "Signs out every phone and computer, including this one. Use it if a device is lost.",
} as const;
