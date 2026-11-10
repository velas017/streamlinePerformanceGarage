import { beforeEach, describe, expect, it, vi } from "vitest";
import { idleFormState } from "@/lib/admin/form-state";

const mockEnv = vi.hoisted(() => ({
  ADMIN_EMAILS: ["owner@example.com"] as string[],
  ADMIN_SECRET: "test-secret-0123456789-abcdefghijklmnop" as string | undefined,
  NEXT_PUBLIC_SITE_URL: "https://shop.example",
  NODE_ENV: "test",
}));
vi.mock("@/lib/env", () => ({ env: mockEnv }));
vi.mock("@/lib/kv", () => ({
  isKvConfigured: () => true,
  kvFresh: vi.fn(async () => null),
}));

const request = vi.hoisted(() => ({ headers: new Headers() }));
vi.mock("next/headers", () => ({
  headers: async () => request.headers,
  cookies: async () => ({ get: () => undefined, set: vi.fn() }),
}));
vi.mock("next/cache", () => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

const form = (fields: Record<string, string> = {}) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
};

beforeEach(() => {
  request.headers = new Headers({ host: "admin.shop.example" });
  mockEnv.ADMIN_SECRET = "test-secret-0123456789-abcdefghijklmnop";
});

describe('admin actions ("use server")', () => {
  it("exports only async functions, or Next.js rejects every submission", async () => {
    const actions: Record<string, unknown> = await import("@/app/admin/actions");
    const exported = Object.entries(actions);
    expect(exported.length).toBeGreaterThan(0);
    for (const [name, value] of exported) {
      expect(
        typeof value === "function" && value.constructor.name === "AsyncFunction",
        `${name} must be an async function`,
      ).toBe(true);
    }
  });

  it("refuses every action that is not called on the admin hostname", async () => {
    const actions = await import("@/app/admin/actions");
    request.headers = new Headers({ host: "shop.example" });
    const calls = [
      actions.signIn(idleFormState, form()),
      actions.verifyCode(idleFormState, form({ code: "123456" })),
      actions.verifyBackupCode(idleFormState, form({ backupCode: "AAAAA-BBBBB" })),
      actions.resendSignInCode(idleFormState, form()),
      actions.requestLink(idleFormState, form()),
      actions.setPassword(idleFormState, form()),
      actions.changeAccountPassword(idleFormState, form()),
      actions.createAccountBackupCodes(idleFormState, form()),
      actions.signOut(),
      actions.signOutAllDevices(),
    ];
    for (const call of calls) await expect(call).rejects.toThrow("NOT_FOUND");
    expect(calls).toHaveLength(Object.keys(actions).length);
  });

  it("sends signed-in actions to the sign-in page when nobody is signed in", async () => {
    const actions = await import("@/app/admin/actions");
    await expect(actions.changeAccountPassword(idleFormState, form())).rejects.toThrow(
      "REDIRECT /admin/sign-in",
    );
    await expect(actions.createAccountBackupCodes(idleFormState, form())).rejects.toThrow(
      "REDIRECT /admin/sign-in",
    );
  });

  it("says the area is not set up instead of signing anyone in without a secret", async () => {
    const actions = await import("@/app/admin/actions");
    mockEnv.ADMIN_SECRET = undefined;
    const state = await actions.signIn(
      idleFormState,
      form({ email: "owner@example.com", password: "anything at all" }),
    );
    expect(state).toMatchObject({ status: "error", message: /not set up/ });
  });

  it("reports field problems without echoing a password back", async () => {
    const actions = await import("@/app/admin/actions");
    const state = await actions.signIn(
      idleFormState,
      form({ email: "not-an-email", password: "" }),
    );
    expect(state).toMatchObject({
      status: "error",
      fieldErrors: {
        email: "Enter a valid email address",
        password: "Enter your password",
      },
      values: { email: "not-an-email" },
    });
    expect(JSON.stringify(state)).not.toContain('password":""');

    const mismatch = await actions.setPassword(
      idleFormState,
      form({
        token: "t",
        newPassword: "long enough password",
        confirmPassword: "different",
      }),
    );
    expect(mismatch).toMatchObject({
      status: "error",
      fieldErrors: { confirmPassword: "The two passwords do not match." },
    });
    expect(JSON.stringify(mismatch)).not.toContain("long enough password");
  });

  it("does not spend a sign-in attempt on a code of the wrong shape", async () => {
    const actions = await import("@/app/admin/actions");
    const state = await actions.verifyCode(idleFormState, form({ code: "12ab" }));
    expect(state).toMatchObject({ status: "error", fieldErrors: { code: /6 digits/ } });
  });
});
