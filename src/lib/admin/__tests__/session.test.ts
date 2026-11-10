import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminRequest } from "@/lib/admin/request";
import {
  endSession,
  getChallengeToken,
  requireSession,
  setChallengeCookie,
  startSession,
} from "@/lib/admin/session";
import { SESSION_TTL_SECONDS, writeSession } from "@/lib/admin/store";
import { createFakeKv } from "@/test/fake-kv";

const OWNER = "owner@example.com";

const mockEnv = vi.hoisted(() => ({
  ADMIN_EMAILS: ["owner@example.com"] as string[],
  ADMIN_SECRET: "test-secret-0123456789-abcdefghijklmnop" as string | undefined,
  NEXT_PUBLIC_SITE_URL: "https://shop.example",
  NODE_ENV: "production",
}));
vi.mock("@/lib/env", () => ({ env: mockEnv }));

const kv = vi.hoisted(() => ({
  exec: (_args: readonly (string | number)[]): unknown => null,
}));
vi.mock("@/lib/kv", () => ({
  isKvConfigured: () => true,
  kvFresh: async (args: readonly (string | number)[]) => kv.exec(args),
}));

/** A stand-in cookie jar and request headers for next/headers. */
const request = vi.hoisted(() => ({
  jar: new Map<string, string>(),
  set: [] as { name: string; value: string; options: Record<string, unknown> }[],
  headers: new Headers(),
}));
vi.mock("next/headers", () => ({
  headers: async () => request.headers,
  cookies: async () => ({
    get: (name: string) =>
      request.jar.has(name) ? { name, value: request.jar.get(name) } : undefined,
    set: (name: string, value: string, options: Record<string, unknown>) => {
      request.set.push({ name, value, options });
      if (options.maxAge === 0) request.jar.delete(name);
      else request.jar.set(name, value);
    },
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
// React's cache() only dedupes inside a server render; here every call reads afresh.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  cache: <T>(fn: T) => fn,
}));

async function signedIn(token = "session-token"): Promise<string> {
  await writeSession(token, { email: OWNER, createdAt: new Date().toISOString() });
  await startSession(token);
  return token;
}

beforeEach(() => {
  kv.exec = createFakeKv().exec;
  request.jar.clear();
  request.set.length = 0;
  request.headers = new Headers({ host: "admin.shop.example" });
  mockEnv.ADMIN_EMAILS = [OWNER];
  mockEnv.ADMIN_SECRET = "test-secret-0123456789-abcdefghijklmnop";
});

describe("admin session cookie", () => {
  it("is HttpOnly, Secure, SameSite=Lax, host-only and lasts 30 days", async () => {
    await signedIn();
    const cookie = request.set.find((entry) => entry.value === "session-token");
    expect(cookie?.name).toBe("__Host-spg-admin-session");
    expect(cookie?.options).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    expect(cookie?.options).not.toHaveProperty("domain");
  });

  it("lets a signed-in admin through and sends everyone else to sign in", async () => {
    await expect(requireSession()).rejects.toThrow("REDIRECT /admin/sign-in");
    const token = await signedIn();
    await expect(requireSession()).resolves.toEqual({ email: OWNER, token });
  });

  it("rejects a cookie that names no stored session", async () => {
    request.jar.set("__Host-spg-admin-session", "made-up");
    await expect(requireSession()).rejects.toThrow("REDIRECT /admin/sign-in");
  });

  it("ends with sign out: the stored session is gone and the cookie is expired", async () => {
    const token = await signedIn();
    await endSession({ email: OWNER, token });
    expect(request.set.at(-1)).toMatchObject({
      name: "__Host-spg-admin-session",
      value: "",
      // Secure must be repeated or browsers ignore the removal of a __Host- cookie.
      options: { maxAge: 0, secure: true, path: "/" },
    });
    request.jar.set("__Host-spg-admin-session", token);
    await expect(requireSession()).rejects.toThrow("REDIRECT /admin/sign-in");
  });

  it("stops working when the email is removed from ADMIN_EMAILS", async () => {
    await signedIn();
    mockEnv.ADMIN_EMAILS = [];
    await expect(requireSession()).rejects.toThrow("REDIRECT /admin/sign-in");
  });

  it("fails closed when the admin area is not configured", async () => {
    await signedIn();
    mockEnv.ADMIN_SECRET = undefined;
    await expect(requireSession()).rejects.toThrow("REDIRECT /admin/sign-in");
  });

  it("keeps the half-finished sign-in in its own short-lived cookie", async () => {
    await setChallengeCookie("challenge-token");
    expect(await getChallengeToken()).toBe("challenge-token");
    expect(request.set.at(-1)?.options).toMatchObject({ httpOnly: true, maxAge: 600 });
    await startSession("session-token");
    expect(await getChallengeToken()).toBeNull();
  });
});

describe("adminRequest", () => {
  it("answers only on the admin hostname", async () => {
    await expect(adminRequest()).resolves.toEqual({ ip: "unknown" });
    request.headers = new Headers({ host: "shop.example" });
    await expect(adminRequest()).rejects.toThrow("NOT_FOUND");
  });

  it("reads the visitor's address from the first forwarded hop", async () => {
    request.headers = new Headers({
      host: "admin.shop.example",
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
    });
    await expect(adminRequest()).resolves.toEqual({ ip: "203.0.113.7" });
  });
});
