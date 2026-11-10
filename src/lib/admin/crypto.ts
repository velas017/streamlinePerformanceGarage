import {
  createHmac,
  randomBytes,
  randomInt,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";
import { env } from "@/lib/env";

/**
 * Password hashing and secret handling for the admin area, on node:crypto
 * alone. Nothing that grants access is stored as-is: passwords are scrypt
 * hashes and every token or code is stored as a hash keyed with ADMIN_SECRET,
 * so a copy of the database cannot be replayed.
 */

/** scrypt cost (OWASP's N=2^15, r=8, p=1 option); stored with each hash so it can be raised later. */
const SCRYPT = { N: 2 ** 15, r: 8, p: 1 } as const;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

function derive(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      KEY_LENGTH,
      { ...options, maxmem: SCRYPT_MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

/** "scrypt$N$r$p$salt$hash", salt and hash in base64url. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, SCRYPT);
  return [
    "scrypt",
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

/** False for a wrong password and for anything that is not a hash from hashPassword. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const options = { N: Number(n), r: Number(r), p: Number(p) };
  if (!Object.values(options).every((value) => Number.isInteger(value) && value > 0)) {
    return false;
  }
  try {
    const expected = Buffer.from(hash, "base64url");
    const actual = await derive(password, Buffer.from(salt, "base64url"), options);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * HMAC-SHA256 of a value under ADMIN_SECRET. `purpose` keeps hashes from one
 * use (a session, say) from ever matching another (a reset link).
 */
export function keyedHash(purpose: string, value: string): string {
  const secret = env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET is not configured");
  return createHmac("sha256", secret).update(`${purpose}\n${value}`).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** 256 random bits, URL-safe: session ids, sign-in challenges, password links. */
export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export const EMAIL_CODE_LENGTH = 6;

/** The emailed sign-in code: uniformly random digits, leading zeros kept. */
export function randomEmailCode(): string {
  return String(randomInt(0, 10 ** EMAIL_CODE_LENGTH)).padStart(EMAIL_CODE_LENGTH, "0");
}

/** No 0/O, 1/I/L or U, so a code read off paper cannot be mistyped into another. */
const BACKUP_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const BACKUP_CODE_LENGTH = 10;

/** One-time backup code such as "7KQ2M-X9RTB" (about 49 random bits). */
export function randomBackupCode(): string {
  const characters = Array.from(
    { length: BACKUP_CODE_LENGTH },
    () => BACKUP_ALPHABET[randomInt(0, BACKUP_ALPHABET.length)] ?? "",
  ).join("");
  const half = BACKUP_CODE_LENGTH / 2;
  return `${characters.slice(0, half)}-${characters.slice(half)}`;
}

/** What gets hashed: upper case, without the dash or stray spaces a person may type. */
export function normalizeBackupCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
