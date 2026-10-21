import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  INSTAGRAM_TOKEN_KEY,
  INSTAGRAM_TOKEN_RUN_KEY,
  getInstagramToken,
  refreshInstagramToken,
} from "@/lib/instagram-token";

const mockEnv = vi.hoisted(() => ({
  INSTAGRAM_ACCESS_TOKEN: undefined as string | undefined,
  KV_REST_API_URL: undefined as string | undefined,
  KV_REST_API_TOKEN: undefined as string | undefined,
}));
vi.mock("@/lib/env", () => ({ env: mockEnv }));

const KV_URL = "https://kv.example.upstash.io";
const NOW = new Date("2026-10-26T09:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

/** In-memory stand-ins for Upstash (GET/SET over REST) and Meta's refresh endpoint. */
const store = new Map<string, string>();
let meta: { status: number; body: unknown };
let kvFails = false;
const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
  const url = String(input);
  if (url === KV_URL) {
    if (kvFails) return Response.json({ error: "ERR unavailable" }, { status: 500 });
    const [cmd, key = "", value = ""] = JSON.parse(String(init?.body)) as string[];
    if (cmd === "GET") return Response.json({ result: store.get(key) ?? null });
    store.set(key, value);
    return Response.json({ result: "OK" });
  }
  if (url.startsWith("https://graph.instagram.com/refresh_access_token")) {
    return Response.json(meta.body, { status: meta.status });
  }
  throw new Error(`Unexpected fetch: ${url}`);
});

function storeToken(token: string, expiresAt: Date) {
  store.set(
    INSTAGRAM_TOKEN_KEY,
    JSON.stringify({
      token,
      refreshedAt: NOW.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }),
  );
}

function refreshCallToken(): string | null {
  const call = fetchMock.mock.calls.find(([input]) =>
    String(input).startsWith("https://graph.instagram.com"),
  );
  return call ? new URL(String(call[0])).searchParams.get("access_token") : null;
}

beforeEach(() => {
  store.clear();
  kvFails = false;
  Object.assign(mockEnv, {
    INSTAGRAM_ACCESS_TOKEN: "env-token",
    KV_REST_API_URL: KV_URL,
    KV_REST_API_TOKEN: "kv-secret",
  });
  meta = { status: 200, body: { access_token: "new-token", expires_in: 60 * 86400 } };
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockClear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getInstagramToken", () => {
  it("prefers the stored token over the environment variable", async () => {
    storeToken("stored-token", new Date(NOW.getTime() + 30 * DAY_MS));
    expect(await getInstagramToken()).toBe("stored-token");
  });

  it("falls back to the environment variable when the store is empty, broken or absent", async () => {
    expect(await getInstagramToken()).toBe("env-token");
    kvFails = true;
    expect(await getInstagramToken()).toBe("env-token");
    mockEnv.KV_REST_API_URL = undefined;
    expect(await getInstagramToken()).toBe("env-token");
  });
});

describe("refreshInstagramToken", () => {
  it("refreshes the freshest token, stores the new one and records the run", async () => {
    storeToken("stored-token", new Date(NOW.getTime() + 30 * DAY_MS));
    const result = await refreshInstagramToken(NOW);

    const expiresAt = new Date(NOW.getTime() + 60 * DAY_MS).toISOString();
    expect(result).toEqual({ ok: true, expiresAt });
    expect(JSON.stringify(result)).not.toContain("new-token");
    expect(refreshCallToken()).toBe("stored-token");
    expect(JSON.parse(store.get(INSTAGRAM_TOKEN_KEY) ?? "{}")).toEqual({
      token: "new-token",
      refreshedAt: NOW.toISOString(),
      expiresAt,
    });
    expect(JSON.parse(store.get(INSTAGRAM_TOKEN_RUN_KEY) ?? "{}")).toMatchObject({
      at: NOW.toISOString(),
      ok: true,
    });
  });

  it("bootstraps from the environment variable on the first run", async () => {
    await refreshInstagramToken(NOW);
    expect(refreshCallToken()).toBe("env-token");
    expect(store.has(INSTAGRAM_TOKEN_KEY)).toBe(true);
  });

  it("keeps the old token, records the failure and warns when expiry is near", async () => {
    storeToken("stored-token", new Date(NOW.getTime() + 5 * DAY_MS));
    meta = { status: 400, body: { error: { message: "Session has expired" } } };
    const result = await refreshInstagramToken(NOW);

    expect(result).toEqual({
      ok: false,
      error: "Meta refresh failed (HTTP 400): Session has expired",
    });
    expect(JSON.parse(store.get(INSTAGRAM_TOKEN_KEY) ?? "{}")).toMatchObject({
      token: "stored-token",
    });
    expect(JSON.parse(store.get(INSTAGRAM_TOKEN_RUN_KEY) ?? "{}")).toMatchObject({
      ok: false,
    });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("expires in 5 days"),
    );
  });

  it("refuses to run without a token store", async () => {
    mockEnv.KV_REST_API_TOKEN = undefined;
    expect(await refreshInstagramToken(NOW)).toEqual({
      ok: false,
      error: "The token store is not configured",
    });
    expect(refreshCallToken()).toBeNull();
  });
});
