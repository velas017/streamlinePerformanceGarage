import { z } from "zod";
import { adminUrl, isAdminEmail } from "@/lib/admin/config";
import {
  hashPassword,
  keyedHash,
  normalizeBackupCode,
  randomBackupCode,
  randomEmailCode,
  randomToken,
  safeEqual,
  verifyPassword,
} from "@/lib/admin/crypto";
import { sendPasswordLink, sendSignInCode } from "@/lib/admin/emails";
import {
  CHALLENGE_TTL_SECONDS,
  challengeHash,
  clearCounts,
  countHit,
  deleteChallenge,
  deleteSessions,
  peekReset,
  readChallenge,
  readCounts,
  readUser,
  recordAudit,
  takeReset,
  writeChallenge,
  writeReset,
  writeSession,
  writeUser,
  type AuditEventType,
} from "@/lib/admin/store";

/**
 * The admin sign-in rules, free of cookies and pages so they can be tested
 * whole: password, then a one-time code by email (or a backup code), with
 * every guessable step counted in Redis.
 *
 * Who may sign in is ADMIN_EMAILS and nothing else. Wrong-password answers
 * never say whether the email is one of them.
 */

const MINUTE = 60;
/** Wrong passwords from one visitor for one email before sign-in pauses. */
export const PASSWORD_ATTEMPT_LIMIT = 5;
export const LOCKOUT_SECONDS = 15 * MINUTE;
/** Wrong passwords from one address, whatever emails it tries. */
const IP_ATTEMPT_LIMIT = 20;
/**
 * Wrong passwords for one email from everywhere. Far above what the owner
 * could mistype, so only a spread-out guessing attack pauses the account.
 */
const ACCOUNT_ATTEMPT_LIMIT = 50;
/** Guesses at one emailed code (or backup code) before that sign-in must start again. */
export const CODE_ATTEMPT_LIMIT = 5;
/** Codes emailed for one sign-in: the first and two resends. */
export const CODE_SEND_LIMIT = 3;
/**
 * Emails per hour to one admin, counted apart for codes and links so that
 * someone requesting links for the shop's (public) address can neither flood
 * the inbox nor use up the owner's sign-in codes.
 */
const CODE_EMAILS_PER_HOUR = 10;
export const LINK_EMAILS_PER_HOUR = 3;
/** Link requests per hour from one visitor, whatever emails they enter. */
const RESET_REQUESTS_PER_HOUR = 5;
const HOUR = 60 * MINUTE;
export const BACKUP_CODE_COUNT = 8;
export const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 200;

export const emailSchema = z
  .email("Enter a valid email address")
  .max(200)
  .transform((value) => value.toLowerCase());

export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, "That password is too long");

/** Where a request came from, for the counters and the activity log. */
export interface RequestOrigin {
  readonly ip: string;
}

function audit(type: AuditEventType, email: string, origin: RequestOrigin) {
  return recordAudit({ type, email, ip: origin.ip, at: new Date().toISOString() });
}

/* ------------------------------ Step 1: password --------------------------- */

interface Counter {
  readonly name: string;
  readonly limit: number;
}

function passwordCounters(email: string, ip: string): readonly [Counter, ...Counter[]] {
  return [
    { name: `password:${ip}:${email}`, limit: PASSWORD_ATTEMPT_LIMIT },
    { name: `password-ip:${ip}`, limit: IP_ATTEMPT_LIMIT },
    { name: `password-account:${email}`, limit: ACCOUNT_ATTEMPT_LIMIT },
  ];
}

async function isLocked(counters: readonly Counter[]): Promise<boolean> {
  const counts = await readCounts(counters.map((counter) => counter.name));
  return counters.some((counter, index) => (counts[index] ?? 0) >= counter.limit);
}

/** Verified against when there is no real hash, so unknown emails take as long as known ones. */
let decoyHash: Promise<string> | undefined;
function decoy(): Promise<string> {
  decoyHash ??= hashPassword(randomToken());
  return decoyHash;
}

/**
 * Checks a password for an email, counting every miss. `ok` only for an
 * allowed email with the right password; the caller cannot tell "no such
 * account" from "wrong password".
 */
async function checkPassword(
  email: string,
  password: string,
  origin: RequestOrigin,
): Promise<"ok" | "invalid" | "locked"> {
  const counters = passwordCounters(email, origin.ip);
  if (await isLocked(counters)) return "locked";

  const user = isAdminEmail(email) ? await readUser(email) : null;
  const matches = await verifyPassword(password, user?.passwordHash ?? (await decoy()));
  if (user?.passwordHash && matches) {
    await clearCounts([counters[0].name]);
    return "ok";
  }

  const [attempts] = await Promise.all(
    counters.map((counter) => countHit(counter.name, LOCKOUT_SECONDS)),
  );
  if (user && attempts === PASSWORD_ATTEMPT_LIMIT) {
    await audit("sign-in-locked", email, origin);
  }
  return "invalid";
}

export type BeginSignInResult =
  | {
      readonly ok: true;
      /** Goes in the visitor's cookie; proves step 1 was passed. */
      readonly challengeToken: string;
      /** False when the code could not be emailed; a backup code still works. */
      readonly emailSent: boolean;
    }
  | { readonly ok: false; readonly reason: "invalid" | "locked" };

export async function beginSignIn(
  input: { readonly email: string; readonly password: string },
  origin: RequestOrigin,
  now = Date.now(),
): Promise<BeginSignInResult> {
  const outcome = await checkPassword(input.email, input.password, origin);
  if (outcome !== "ok") return { ok: false, reason: outcome };

  const challengeToken = randomToken();
  const hash = challengeHash(challengeToken);
  const code = randomEmailCode();
  await writeChallenge(
    hash,
    {
      email: input.email,
      codeHash: codeHash(hash, code),
      sends: 1,
      expiresAt: now + CHALLENGE_TTL_SECONDS * 1000,
    },
    now,
  );
  return { ok: true, challengeToken, emailSent: await emailCode(input.email, code) };
}

/** Bound to its challenge, so a code is worthless with any other sign-in. */
function codeHash(challenge: string, code: string): string {
  return keyedHash("code", `${challenge}:${code}`);
}

/** Never throws: a sign-in must still be finishable with a backup code when email is down. */
async function emailCode(email: string, code: string): Promise<boolean> {
  try {
    if ((await countHit(`code-emails:${email}`, HOUR)) > CODE_EMAILS_PER_HOUR) {
      return false;
    }
    await sendSignInCode(email, code);
    return true;
  } catch (error) {
    console.error("[admin] could not email the sign-in code:", error);
    return false;
  }
}

/* -------------------------------- Step 2: code ----------------------------- */

export type CompleteSignInResult =
  | {
      readonly ok: true;
      /** Goes in the visitor's session cookie. */
      readonly sessionToken: string;
      readonly email: string;
    }
  /** `expired`: the sign-in ran out of time or guesses and must start again. */
  | { readonly ok: false; readonly reason: "invalid" | "expired" };

/** Who a pending sign-in is for, to show "we sent a code to …". */
export async function pendingSignIn(
  challengeToken: string,
  now = Date.now(),
): Promise<{ readonly email: string } | null> {
  const challenge = await readChallenge(challengeHash(challengeToken), now);
  return challenge ? { email: challenge.email } : null;
}

/**
 * Finishes a sign-in with the emailed code or one of the account's backup
 * codes. Guesses are counted before anything is compared, so parallel
 * requests cannot buy extra tries, and the challenge is deleted before the
 * session exists, so one code opens one session.
 */
export async function completeSignIn(
  input: {
    readonly challengeToken: string;
    readonly code: string;
    readonly kind: "email" | "backup";
  },
  origin: RequestOrigin,
  now = Date.now(),
): Promise<CompleteSignInResult> {
  const hash = challengeHash(input.challengeToken);
  if ((await countHit(`code:${hash}`, CHALLENGE_TTL_SECONDS)) > CODE_ATTEMPT_LIMIT) {
    await deleteChallenge(hash);
    return { ok: false, reason: "expired" };
  }
  const challenge = await readChallenge(hash, now);
  if (!challenge || !isAdminEmail(challenge.email)) {
    return { ok: false, reason: "expired" };
  }
  const { email } = challenge;

  if (input.kind === "email") {
    const guess = codeHash(hash, input.code.replace(/\D/g, ""));
    if (!safeEqual(guess, challenge.codeHash)) return { ok: false, reason: "invalid" };
  } else {
    const user = await readUser(email);
    const guess = keyedHash("backup", `${email}:${normalizeBackupCode(input.code)}`);
    if (!user.backupCodes.some((stored) => safeEqual(stored, guess))) {
      return { ok: false, reason: "invalid" };
    }
    await writeUser({
      ...user,
      backupCodes: user.backupCodes.filter((stored) => stored !== guess),
    });
  }

  if (!(await deleteChallenge(hash))) return { ok: false, reason: "expired" };
  const sessionToken = randomToken();
  await writeSession(sessionToken, { email, createdAt: new Date(now).toISOString() });
  await audit(input.kind === "email" ? "sign-in" : "sign-in-backup-code", email, origin);
  return { ok: true, sessionToken, email };
}

export type ResendCodeResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "expired" | "limit" | "unsent" };

/** Emails a fresh code for the same sign-in; the earlier code stops working. */
export async function resendCode(
  challengeToken: string,
  now = Date.now(),
): Promise<ResendCodeResult> {
  const hash = challengeHash(challengeToken);
  const challenge = await readChallenge(hash, now);
  if (!challenge) return { ok: false, reason: "expired" };
  if (challenge.sends >= CODE_SEND_LIMIT) return { ok: false, reason: "limit" };
  const code = randomEmailCode();
  await writeChallenge(
    hash,
    { ...challenge, codeHash: codeHash(hash, code), sends: challenge.sends + 1 },
    now,
  );
  return (await emailCode(challenge.email, code))
    ? { ok: true }
    : { ok: false, reason: "unsent" };
}

/* ------------------------------ Password links ----------------------------- */

/**
 * Emails a link to choose a password, for first-time setup and for a
 * forgotten one. Resolves the same way whether or not the email is allowed,
 * so the form cannot be used to find out who has an account. Returns false
 * only when this visitor has asked too often.
 */
export async function requestPasswordLink(
  email: string,
  origin: RequestOrigin,
): Promise<boolean> {
  if ((await countHit(`reset-ip:${origin.ip}`, HOUR)) > RESET_REQUESTS_PER_HOUR) {
    return false;
  }
  if (!isAdminEmail(email)) return true;
  try {
    if ((await countHit(`link-emails:${email}`, HOUR)) > LINK_EMAILS_PER_HOUR) {
      return true;
    }
    const token = randomToken();
    await writeReset(token, email);
    await sendPasswordLink(
      email,
      adminUrl(`/admin/set-password?token=${encodeURIComponent(token)}`),
    );
  } catch (error) {
    console.error("[admin] could not email the password link:", error);
  }
  return true;
}

/** Whether a password link is still good, without spending it. */
export async function isPasswordLinkValid(token: string): Promise<boolean> {
  const email = await peekReset(token);
  return email !== null && isAdminEmail(email);
}

async function savePassword(email: string, password: string, now: number): Promise<void> {
  const user = await readUser(email);
  await writeUser({
    ...user,
    passwordHash: await hashPassword(password),
    passwordSetAt: new Date(now).toISOString(),
  });
}

/**
 * Spends a password link and sets the password. Every device is signed out
 * and the wrong-password count for the account starts over. False when the
 * link was already used or has expired.
 */
export async function setPasswordFromLink(
  input: { readonly token: string; readonly password: string },
  origin: RequestOrigin,
  now = Date.now(),
): Promise<boolean> {
  const email = await takeReset(input.token);
  if (!email || !isAdminEmail(email)) return false;
  await savePassword(email, input.password, now);
  await deleteSessions(email);
  await clearCounts(passwordCounters(email, origin.ip).map((counter) => counter.name));
  await audit("password-set", email, origin);
  return true;
}

/* ------------------------------ Signed-in actions -------------------------- */

/**
 * Changes the password of a signed-in admin after re-checking the current
 * one (counted like a sign-in attempt). Other devices are signed out; the one
 * making the change stays in.
 */
export async function changePassword(
  input: {
    readonly email: string;
    readonly currentPassword: string;
    readonly newPassword: string;
    readonly sessionToken: string;
  },
  origin: RequestOrigin,
  now = Date.now(),
): Promise<"ok" | "invalid" | "locked"> {
  const outcome = await checkPassword(input.email, input.currentPassword, origin);
  if (outcome !== "ok") return outcome;
  await savePassword(input.email, input.newPassword, now);
  await deleteSessions(input.email, input.sessionToken);
  await audit("password-changed", input.email, origin);
  return "ok";
}

/** Replaces the account's backup codes and returns the new ones, shown once. */
export async function createBackupCodes(
  email: string,
  origin: RequestOrigin,
): Promise<string[]> {
  const codes = Array.from({ length: BACKUP_CODE_COUNT }, randomBackupCode);
  const user = await readUser(email);
  await writeUser({
    ...user,
    backupCodes: codes.map((code) =>
      keyedHash("backup", `${email}:${normalizeBackupCode(code)}`),
    ),
  });
  await audit("backup-codes-created", email, origin);
  return codes;
}

export async function signOutEverywhere(
  email: string,
  origin: RequestOrigin,
): Promise<void> {
  await deleteSessions(email);
  await audit("sign-out-everywhere", email, origin);
}

/** For the sign-out button: the activity log entry; the session itself ends in lib/admin/session.ts. */
export async function recordSignOut(email: string, origin: RequestOrigin): Promise<void> {
  await audit("sign-out", email, origin);
}
