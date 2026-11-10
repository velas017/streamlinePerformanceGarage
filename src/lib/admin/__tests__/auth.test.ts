import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  beginSignIn,
  changePassword,
  CODE_ATTEMPT_LIMIT,
  CODE_SEND_LIMIT,
  completeSignIn,
  createBackupCodes,
  isPasswordLinkValid,
  LINK_EMAILS_PER_HOUR,
  LOCKOUT_SECONDS,
  PASSWORD_ATTEMPT_LIMIT,
  pendingSignIn,
  requestPasswordLink,
  resendCode,
  setPasswordFromLink,
  signOutEverywhere,
} from "@/lib/admin/auth";
import { sendPasswordLink, sendSignInCode } from "@/lib/admin/emails";
import {
  CHALLENGE_TTL_SECONDS,
  readAudit,
  readSession,
  readUser,
  RESET_TTL_SECONDS,
  SESSION_TTL_SECONDS,
} from "@/lib/admin/store";
import { createFakeKv } from "@/test/fake-kv";

const OWNER = "owner@example.com";
const PASSWORD = "correct horse battery";
const ORIGIN = { ip: "203.0.113.7" };
const ELSEWHERE = { ip: "198.51.100.9" };

const mockEnv = vi.hoisted(() => ({
  ADMIN_EMAILS: ["owner@example.com"] as string[],
  ADMIN_SECRET: "test-secret-0123456789-abcdefghijklmnop",
  NEXT_PUBLIC_SITE_URL: "https://shop.example",
}));
vi.mock("@/lib/env", () => ({ env: mockEnv }));

/** The store's clock; tests move it to let codes, links and lockouts run out. */
const clock = vi.hoisted(() => ({ now: 0 }));
const kv = vi.hoisted(() => ({
  exec: (_args: readonly (string | number)[]): unknown => null,
}));
vi.mock("@/lib/kv", () => ({
  isKvConfigured: () => true,
  kvFresh: async (args: readonly (string | number)[]) => kv.exec(args),
}));
vi.mock("@/lib/admin/emails", () => ({
  sendSignInCode: vi.fn(async () => {}),
  sendPasswordLink: vi.fn(async () => {}),
}));

let store = createFakeKv(() => clock.now);

function advance(seconds: number) {
  clock.now += seconds * 1000;
}

function lastCode(): string {
  const call = vi.mocked(sendSignInCode).mock.calls.at(-1);
  if (!call) throw new Error("no sign-in code was emailed");
  return call[1];
}

function lastLinkToken(): string {
  const call = vi.mocked(sendPasswordLink).mock.calls.at(-1);
  if (!call) throw new Error("no password link was emailed");
  const token = new URL(call[1]).searchParams.get("token");
  if (!token) throw new Error("the password link has no token");
  return token;
}

/** Gives the owner a password the way a person does: through an emailed link. */
async function givePassword(password = PASSWORD) {
  await requestPasswordLink(OWNER, ORIGIN);
  expect(await setPasswordFromLink({ token: lastLinkToken(), password }, ORIGIN)).toBe(
    true,
  );
}

async function passwordStep(password = PASSWORD, origin = ORIGIN) {
  return beginSignIn({ email: OWNER, password }, origin, clock.now);
}

async function challenge(): Promise<string> {
  const result = await passwordStep();
  if (!result.ok) throw new Error(`password step failed: ${result.reason}`);
  return result.challengeToken;
}

function codeStep(
  challengeToken: string,
  code: string,
  kind: "email" | "backup" = "email",
) {
  return completeSignIn({ challengeToken, code, kind }, ORIGIN, clock.now);
}

async function signIn(): Promise<string> {
  const result = await codeStep(await challenge(), lastCode());
  if (!result.ok) throw new Error(`code step failed: ${result.reason}`);
  return result.sessionToken;
}

beforeEach(() => {
  clock.now = Date.parse("2026-11-10T15:00:00.000Z");
  store = createFakeKv(() => clock.now);
  kv.exec = store.exec;
  mockEnv.ADMIN_EMAILS = [OWNER];
  vi.mocked(sendSignInCode).mockReset().mockResolvedValue(undefined);
  vi.mocked(sendPasswordLink).mockReset().mockResolvedValue(undefined);
});

describe("admin sign-in: password", () => {
  it("gives the same answer for a wrong password and an unknown email", async () => {
    await givePassword();
    expect(await passwordStep("not the password")).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(
      await beginSignIn({ email: "stranger@example.com", password: PASSWORD }, ORIGIN),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(sendSignInCode).not.toHaveBeenCalled();
  });

  it("does not let an allowed email in before a password has been chosen", async () => {
    expect(await passwordStep("")).toEqual({ ok: false, reason: "invalid" });
    expect(await passwordStep(PASSWORD)).toEqual({ ok: false, reason: "invalid" });
  });

  it("emails a code after the right password, and no session exists yet", async () => {
    await givePassword();
    const result = await passwordStep();
    expect(result.ok && result.emailSent).toBe(true);
    expect(sendSignInCode).toHaveBeenCalledWith(OWNER, expect.stringMatching(/^\d{6}$/));
    expect(store.keys().some((key) => key.startsWith("admin:session:"))).toBe(false);
  });

  it("pauses sign-in after the limit of wrong passwords, even for the right one", async () => {
    await givePassword();
    for (let attempt = 0; attempt < PASSWORD_ATTEMPT_LIMIT; attempt += 1) {
      expect(await passwordStep(`wrong ${attempt}`)).toEqual({
        ok: false,
        reason: "invalid",
      });
    }
    expect(await passwordStep()).toEqual({ ok: false, reason: "locked" });
    expect((await readAudit(10)).map((entry) => entry.type)).toContain("sign-in-locked");

    advance(LOCKOUT_SECONDS + 1);
    expect((await passwordStep()).ok).toBe(true);
  });

  it("locks out the guesser, not the owner signing in from somewhere else", async () => {
    await givePassword();
    for (let attempt = 0; attempt < PASSWORD_ATTEMPT_LIMIT; attempt += 1) {
      await passwordStep(`wrong ${attempt}`, ELSEWHERE);
    }
    expect(await passwordStep(PASSWORD, ELSEWHERE)).toEqual({
      ok: false,
      reason: "locked",
    });
    expect((await passwordStep(PASSWORD, ORIGIN)).ok).toBe(true);
  });

  it("starts the count over after a successful password", async () => {
    await givePassword();
    for (let attempt = 0; attempt < PASSWORD_ATTEMPT_LIMIT - 1; attempt += 1) {
      await passwordStep(`wrong ${attempt}`);
    }
    expect((await passwordStep()).ok).toBe(true);
    for (let attempt = 0; attempt < PASSWORD_ATTEMPT_LIMIT - 1; attempt += 1) {
      expect(await passwordStep(`wrong ${attempt}`)).toEqual({
        ok: false,
        reason: "invalid",
      });
    }
  });
});

describe("admin sign-in: emailed code", () => {
  beforeEach(() => givePassword());

  it("opens a session that lasts 30 days with the right code", async () => {
    const token = await challenge();
    expect(await pendingSignIn(token, clock.now)).toEqual({ email: OWNER });
    const result = await codeStep(token, lastCode());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await readSession(result.sessionToken)).toMatchObject({ email: OWNER });

    advance(SESSION_TTL_SECONDS - 60);
    expect(await readSession(result.sessionToken)).not.toBeNull();
    advance(120);
    expect(await readSession(result.sessionToken)).toBeNull();
  });

  it("works once: the same code cannot open a second session", async () => {
    const token = await challenge();
    const code = lastCode();
    expect((await codeStep(token, code)).ok).toBe(true);
    expect(await codeStep(token, code)).toEqual({ ok: false, reason: "expired" });
  });

  it("expires after ten minutes", async () => {
    const token = await challenge();
    advance(CHALLENGE_TTL_SECONDS + 1);
    expect(await codeStep(token, lastCode())).toEqual({ ok: false, reason: "expired" });
  });

  it("ends the sign-in after too many wrong codes, right code included", async () => {
    const token = await challenge();
    const code = lastCode();
    const wrong = code === "000000" ? "000001" : "000000";
    for (let attempt = 0; attempt < CODE_ATTEMPT_LIMIT; attempt += 1) {
      expect(await codeStep(token, wrong)).toEqual({ ok: false, reason: "invalid" });
    }
    expect(await codeStep(token, code)).toEqual({ ok: false, reason: "expired" });
  });

  it("is tied to its own sign-in: a code does nothing for another one", async () => {
    await challenge();
    const firstCode = lastCode();
    const second = await challenge();
    if (firstCode !== lastCode()) {
      expect(await codeStep(second, firstCode)).toEqual({ ok: false, reason: "invalid" });
    }
    expect(await codeStep("made-up-token", firstCode)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("a resent code replaces the earlier one, up to the send limit", async () => {
    const token = await challenge();
    const first = lastCode();
    expect(await resendCode(token, clock.now)).toEqual({ ok: true });
    const second = lastCode();
    if (first !== second) {
      expect(await codeStep(token, first)).toEqual({ ok: false, reason: "invalid" });
    }
    for (let sends = 2; sends < CODE_SEND_LIMIT; sends += 1) {
      expect(await resendCode(token, clock.now)).toEqual({ ok: true });
    }
    expect(await resendCode(token, clock.now)).toEqual({ ok: false, reason: "limit" });
    expect((await codeStep(token, lastCode())).ok).toBe(true);
  });

  it("stops working the moment the email leaves ADMIN_EMAILS", async () => {
    const token = await challenge();
    mockEnv.ADMIN_EMAILS = [];
    expect(await codeStep(token, lastCode())).toEqual({ ok: false, reason: "expired" });
  });
});

describe("admin sign-in: backup codes", () => {
  beforeEach(() => givePassword());

  it("finishes a sign-in when the email cannot be sent, once per code", async () => {
    const codes = await createBackupCodes(OWNER, ORIGIN);
    expect(new Set(codes).size).toBe(codes.length);
    vi.mocked(sendSignInCode).mockRejectedValue(new Error("Resend is down"));
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const first = await passwordStep();
    expect(first).toMatchObject({ ok: true, emailSent: false });
    if (!first.ok) return;
    const typed = (codes[0] ?? "").toLowerCase().replace("-", " ");
    expect((await codeStep(first.challengeToken, typed, "backup")).ok).toBe(true);
    expect((await readUser(OWNER)).backupCodes).toHaveLength(codes.length - 1);

    const second = await passwordStep();
    if (!second.ok) return;
    expect(await codeStep(second.challengeToken, codes[0] ?? "", "backup")).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect((await codeStep(second.challengeToken, codes[1] ?? "", "backup")).ok).toBe(
      true,
    );
    errors.mockRestore();
  });

  it("new codes cancel the old ones", async () => {
    const [oldCode = ""] = await createBackupCodes(OWNER, ORIGIN);
    await createBackupCodes(OWNER, ORIGIN);
    expect(await codeStep(await challenge(), oldCode, "backup")).toEqual({
      ok: false,
      reason: "invalid",
    });
  });
});

describe("admin password links", () => {
  it("emails nothing to an address that may not sign in, and says the same thing", async () => {
    expect(await requestPasswordLink("stranger@example.com", ORIGIN)).toBe(true);
    expect(sendPasswordLink).not.toHaveBeenCalled();
    expect(store.keys().some((key) => key.startsWith("admin:reset:"))).toBe(false);
  });

  it("links to the admin host and works exactly once", async () => {
    await requestPasswordLink(OWNER, ORIGIN);
    const [to, url] = vi.mocked(sendPasswordLink).mock.calls.at(-1) ?? [];
    expect(to).toBe(OWNER);
    expect(url).toMatch(/^https:\/\/admin\.shop\.example\/admin\/set-password\?token=/);

    const token = lastLinkToken();
    expect(await isPasswordLinkValid(token)).toBe(true);
    expect(await setPasswordFromLink({ token, password: PASSWORD }, ORIGIN)).toBe(true);
    expect(await isPasswordLinkValid(token)).toBe(false);
    expect(
      await setPasswordFromLink({ token, password: "another password" }, ORIGIN),
    ).toBe(false);
    expect((await passwordStep()).ok).toBe(true);
  });

  it("expires after an hour", async () => {
    await requestPasswordLink(OWNER, ORIGIN);
    advance(RESET_TTL_SECONDS + 1);
    expect(
      await setPasswordFromLink({ token: lastLinkToken(), password: PASSWORD }, ORIGIN),
    ).toBe(false);
  });

  it("signs every device out when the password is reset", async () => {
    await givePassword();
    const session = await signIn();
    await givePassword("a brand new password");
    expect(await readSession(session)).toBeNull();
    expect(await passwordStep(PASSWORD)).toEqual({ ok: false, reason: "invalid" });
  });

  it("caps link emails to one inbox without using up the sign-in codes", async () => {
    await givePassword();
    vi.mocked(sendPasswordLink).mockClear();
    // Different visitors each time, so only the per-inbox cap is in play.
    for (let request = 0; request < LINK_EMAILS_PER_HOUR + 4; request += 1) {
      expect(await requestPasswordLink(OWNER, { ip: `192.0.2.${request}` })).toBe(true);
    }
    expect(sendPasswordLink).toHaveBeenCalledTimes(LINK_EMAILS_PER_HOUR - 1);
    expect(await passwordStep()).toMatchObject({ ok: true, emailSent: true });
  });

  it("stops answering a visitor who asks too often", async () => {
    const answers = [];
    for (let request = 0; request < 7; request += 1) {
      answers.push(await requestPasswordLink("stranger@example.com", ORIGIN));
    }
    expect(answers).toEqual([true, true, true, true, true, false, false]);
  });
});

describe("signed-in admin actions", () => {
  beforeEach(() => givePassword());

  it("changes the password only with the current one, and keeps this device signed in", async () => {
    const here = await signIn();
    const other = await signIn();
    const change = (currentPassword: string) =>
      changePassword(
        {
          email: OWNER,
          currentPassword,
          newPassword: "a brand new password",
          sessionToken: here,
        },
        ORIGIN,
        clock.now,
      );

    expect(await change("not my password")).toBe("invalid");
    expect(await readSession(other)).not.toBeNull();

    expect(await change(PASSWORD)).toBe("ok");
    expect(await readSession(here)).not.toBeNull();
    expect(await readSession(other)).toBeNull();
    expect(await passwordStep(PASSWORD)).toEqual({ ok: false, reason: "invalid" });
    expect((await passwordStep("a brand new password")).ok).toBe(true);
  });

  it("signs out of every device at once", async () => {
    const sessions = [await signIn(), await signIn()];
    await signOutEverywhere(OWNER, ORIGIN);
    for (const session of sessions) expect(await readSession(session)).toBeNull();
  });

  it("keeps a log of what happened, newest first", async () => {
    await signIn();
    await createBackupCodes(OWNER, ORIGIN);
    expect((await readAudit(10)).map((entry) => entry.type)).toEqual([
      "backup-codes-created",
      "sign-in",
      "password-set",
    ]);
  });
});

describe("what the admin area stores", () => {
  it("never holds a password, code, link or session token in readable form", async () => {
    await requestPasswordLink(OWNER, ORIGIN);
    const linkToken = lastLinkToken();
    const beforeUse = store.dump();
    await setPasswordFromLink({ token: linkToken, password: PASSWORD }, ORIGIN);
    const backupCodes = await createBackupCodes(OWNER, ORIGIN);
    const challengeToken = await challenge();
    const code = lastCode();
    const duringSignIn = store.dump();
    const result = await codeStep(challengeToken, code);
    if (!result.ok) throw new Error("sign-in failed");

    const everything = [beforeUse, duringSignIn, store.dump()].join("\n");
    const secrets = [
      PASSWORD,
      linkToken,
      challengeToken,
      result.sessionToken,
      ...backupCodes,
    ];
    for (const secret of secrets) expect(everything).not.toContain(secret);
    expect(duringSignIn).not.toContain(`"${code}"`);
    expect(everything).not.toContain(mockEnv.ADMIN_SECRET);
  });
});
