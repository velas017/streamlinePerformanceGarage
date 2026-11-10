import { describe, expect, it, vi } from "vitest";
import {
  EMAIL_CODE_LENGTH,
  hashPassword,
  keyedHash,
  normalizeBackupCode,
  randomBackupCode,
  randomEmailCode,
  randomToken,
  safeEqual,
  verifyPassword,
} from "@/lib/admin/crypto";

const mockEnv = vi.hoisted(() => ({
  ADMIN_SECRET: "test-secret-0123456789-abcdefghijklmnop" as string | undefined,
}));
vi.mock("@/lib/env", () => ({ env: mockEnv }));

describe("admin password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("correct horse");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("correct horse batterx", hash)).toBe(false);
  });

  it("salts every hash, so the same password never stores the same value", async () => {
    expect(await hashPassword("same password here")).not.toBe(
      await hashPassword("same password here"),
    );
  });

  it("treats anything that is not one of its hashes as a wrong password", async () => {
    for (const stored of ["", "plain-text", "scrypt$0$8$1$c2FsdA$aGFzaA", "bcrypt$a$b"]) {
      expect(await verifyPassword("anything at all", stored)).toBe(false);
    }
  });
});

describe("admin secrets", () => {
  it("hashes the same value differently for different purposes", () => {
    expect(keyedHash("session", "abc")).toBe(keyedHash("session", "abc"));
    expect(keyedHash("session", "abc")).not.toBe(keyedHash("reset", "abc"));
    expect(keyedHash("session", "abc")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("refuses to hash without ADMIN_SECRET instead of using a guessable key", () => {
    mockEnv.ADMIN_SECRET = undefined;
    expect(() => keyedHash("session", "abc")).toThrow(/ADMIN_SECRET/);
    mockEnv.ADMIN_SECRET = "test-secret-0123456789-abcdefghijklmnop";
  });

  it("compares strings without leaking on length", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("makes long random tokens, digit-only email codes and readable backup codes", () => {
    expect(randomToken()).toMatch(/^[\w-]{43}$/);
    expect(randomToken()).not.toBe(randomToken());
    for (let i = 0; i < 50; i += 1) {
      expect(randomEmailCode()).toMatch(new RegExp(`^\\d{${EMAIL_CODE_LENGTH}}$`));
      expect(randomBackupCode()).toMatch(/^[2-9A-HJKMNP-TV-Z]{5}-[2-9A-HJKMNP-TV-Z]{5}$/);
    }
  });

  it("accepts a backup code however it is typed", () => {
    expect(normalizeBackupCode(" 7kq2m x9rtb ")).toBe("7KQ2MX9RTB");
    expect(normalizeBackupCode("7KQ2M-X9RTB")).toBe("7KQ2MX9RTB");
  });
});
