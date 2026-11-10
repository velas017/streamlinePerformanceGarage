import { z } from "zod";
import { keyedHash } from "@/lib/admin/crypto";
import { kvFresh } from "@/lib/kv";

/**
 * Everything the admin area keeps in Redis, under "admin:". Values are JSON,
 * validated on the way out. Sessions, sign-in challenges and password links
 * are keyed by a hash of their secret, never the secret itself, and expire on
 * their own.
 */
const DAY_SECONDS = 24 * 60 * 60;
export const SESSION_TTL_SECONDS = 30 * DAY_SECONDS;
export const CHALLENGE_TTL_SECONDS = 10 * 60;
export const RESET_TTL_SECONDS = 60 * 60;
const AUDIT_KEY = "admin:audit";
const AUDIT_MAX_ENTRIES = 200;

const key = {
  user: (email: string) => `admin:user:${email}`,
  session: (hash: string) => `admin:session:${hash}`,
  sessionIndex: (email: string) => `admin:sessions:${email}`,
  challenge: (hash: string) => `admin:challenge:${hash}`,
  reset: (hash: string) => `admin:reset:${hash}`,
  /** Hashed so a counter key has a fixed size whatever a visitor typed. */
  counter: (name: string) => `admin:count:${keyedHash("counter", name)}`,
} as const;

function toInt(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

async function readJson<T>(redisKey: string, schema: z.ZodType<T>): Promise<T | null> {
  const raw = await kvFresh(["GET", redisKey]);
  if (typeof raw !== "string") return null;
  return parseJson(raw, schema);
}

function parseJson<T>(raw: string, schema: z.ZodType<T>): T | null {
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function writeJson(
  redisKey: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<void> {
  const base = ["SET", redisKey, JSON.stringify(value)];
  await kvFresh(ttlSeconds ? [...base, "EX", Math.max(1, ttlSeconds)] : base);
}

/** True when the key existed, so a one-time secret can only be spent once. */
async function remove(redisKey: string): Promise<boolean> {
  return toInt(await kvFresh(["DEL", redisKey])) > 0;
}

/* ---------------------------------- Users --------------------------------- */

const userSchema = z.object({
  email: z.email(),
  /** Null until the person chooses a password from an emailed link. */
  passwordHash: z.string().nullable(),
  passwordSetAt: z.iso.datetime().nullable(),
  /** Keyed hashes of the unused backup codes. */
  backupCodes: z.array(z.string()),
});
export type AdminUser = z.infer<typeof userSchema>;

/** The stored account, or a blank one: who may sign in is decided by ADMIN_EMAILS, not here. */
export async function readUser(email: string): Promise<AdminUser> {
  return (
    (await readJson(key.user(email), userSchema)) ?? {
      email,
      passwordHash: null,
      passwordSetAt: null,
      backupCodes: [],
    }
  );
}

export async function writeUser(user: AdminUser): Promise<void> {
  await writeJson(key.user(user.email), user);
}

/* -------------------------------- Sessions -------------------------------- */

const sessionSchema = z.object({
  email: z.email(),
  createdAt: z.iso.datetime(),
});
export type StoredSession = z.infer<typeof sessionSchema>;

export function sessionHash(token: string): string {
  return keyedHash("session", token);
}

export async function writeSession(token: string, session: StoredSession): Promise<void> {
  const hash = sessionHash(token);
  await writeJson(key.session(hash), session, SESSION_TTL_SECONDS);
  // The index only exists so "sign out everywhere" can find them all.
  await kvFresh(["SADD", key.sessionIndex(session.email), hash]);
  await kvFresh(["EXPIRE", key.sessionIndex(session.email), SESSION_TTL_SECONDS]);
}

export async function readSession(token: string): Promise<StoredSession | null> {
  return readJson(key.session(sessionHash(token)), sessionSchema);
}

export async function deleteSession(token: string, email: string): Promise<void> {
  const hash = sessionHash(token);
  await remove(key.session(hash));
  await kvFresh(["SREM", key.sessionIndex(email), hash]);
}

/** Ends every session of an account, except optionally the one making the request. */
export async function deleteSessions(email: string, keepToken?: string): Promise<void> {
  const keep = keepToken ? sessionHash(keepToken) : null;
  const members = z
    .array(z.string())
    .catch([])
    .parse(await kvFresh(["SMEMBERS", key.sessionIndex(email)]));
  const ended = members.filter((hash) => hash !== keep);
  if (ended.length === 0) return;
  await kvFresh(["DEL", ...ended.map(key.session)]);
  await kvFresh(["SREM", key.sessionIndex(email), ...ended]);
}

/* -------------------------- Sign-in challenges ----------------------------- */

const challengeSchema = z.object({
  email: z.email(),
  /** Keyed hash of the emailed code. */
  codeHash: z.string(),
  /** How many codes have been emailed for this sign-in. */
  sends: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
});
export type Challenge = z.infer<typeof challengeSchema>;

export function challengeHash(token: string): string {
  return keyedHash("challenge", token);
}

/** Writes a challenge so that it disappears exactly at its own `expiresAt`. */
export async function writeChallenge(
  hash: string,
  challenge: Challenge,
  now: number,
): Promise<void> {
  const ttl = Math.ceil((challenge.expiresAt - now) / 1000);
  await writeJson(key.challenge(hash), challenge, ttl);
}

export async function readChallenge(
  hash: string,
  now: number,
): Promise<Challenge | null> {
  const challenge = await readJson(key.challenge(hash), challengeSchema);
  return challenge && challenge.expiresAt > now ? challenge : null;
}

export async function deleteChallenge(hash: string): Promise<boolean> {
  return remove(key.challenge(hash));
}

/* ----------------------------- Password links ------------------------------ */

const resetSchema = z.object({ email: z.email() });

function resetKey(token: string): string {
  return key.reset(keyedHash("reset", token));
}

export async function writeReset(token: string, email: string): Promise<void> {
  await writeJson(resetKey(token), { email }, RESET_TTL_SECONDS);
}

/** Who a password link is for, without spending it (the page shows the form first). */
export async function peekReset(token: string): Promise<string | null> {
  return (await readJson(resetKey(token), resetSchema))?.email ?? null;
}

/** Spends a password link: the email it was for, or null if it was already used or expired. */
export async function takeReset(token: string): Promise<string | null> {
  const raw = await kvFresh(["GETDEL", resetKey(token)]);
  return typeof raw === "string" ? (parseJson(raw, resetSchema)?.email ?? null) : null;
}

/* -------------------------------- Counters --------------------------------- */

/**
 * Adds one to a counter that resets `windowSeconds` after its first hit and
 * returns the new total. INCR is atomic, so parallel requests cannot share a
 * count. The TTL check repairs a counter left without an expiry (a request cut
 * off between the two commands), which would otherwise lock someone out for good.
 */
export async function countHit(name: string, windowSeconds: number): Promise<number> {
  const redisKey = key.counter(name);
  const count = toInt(await kvFresh(["INCR", redisKey]));
  if (count === 1 || toInt(await kvFresh(["TTL", redisKey])) < 0) {
    await kvFresh(["EXPIRE", redisKey, windowSeconds]);
  }
  return count;
}

export async function readCounts(names: readonly string[]): Promise<number[]> {
  const values = z
    .array(z.unknown())
    .catch([])
    .parse(await kvFresh(["MGET", ...names.map(key.counter)]));
  return names.map((_name, index) => toInt(values[index]));
}

export async function clearCounts(names: readonly string[]): Promise<void> {
  await kvFresh(["DEL", ...names.map(key.counter)]);
}

/* ------------------------------- Activity log ------------------------------ */

export const auditEventTypes = [
  "sign-in",
  "sign-in-backup-code",
  "sign-in-locked",
  "sign-out",
  "sign-out-everywhere",
  "password-set",
  "password-changed",
  "backup-codes-created",
] as const;
export type AuditEventType = (typeof auditEventTypes)[number];

/** How each event reads in the activity list on the account page. */
export const auditEventLabels = {
  "sign-in": "Signed in",
  "sign-in-backup-code": "Signed in with a backup code",
  "sign-in-locked": "Sign-in paused after too many wrong passwords",
  "sign-out": "Signed out",
  "sign-out-everywhere": "Signed out of all devices",
  "password-set": "Password set from an emailed link",
  "password-changed": "Password changed",
  "backup-codes-created": "New backup codes created",
} as const satisfies Record<AuditEventType, string>;

const auditSchema = z.object({
  type: z.enum(auditEventTypes),
  email: z.email(),
  at: z.iso.datetime(),
  ip: z.string(),
});
export type AuditEntry = z.infer<typeof auditSchema>;

/** Best effort: a log that cannot be written must never block the action it describes. */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await kvFresh(["LPUSH", AUDIT_KEY, JSON.stringify(entry)]);
    await kvFresh(["LTRIM", AUDIT_KEY, 0, AUDIT_MAX_ENTRIES - 1]);
  } catch (error) {
    console.error("[admin] could not record activity:", error);
  }
}

/** Newest first. */
export async function readAudit(limit: number): Promise<AuditEntry[]> {
  const rows = z
    .array(z.string())
    .catch([])
    .parse(await kvFresh(["LRANGE", AUDIT_KEY, 0, limit - 1]));
  return rows.flatMap((row) => parseJson(row, auditSchema) ?? []);
}
