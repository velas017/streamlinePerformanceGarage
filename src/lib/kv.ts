import { z } from "zod";
import { env } from "@/lib/env";

/**
 * Minimal Upstash Redis client over its REST API: one POST per command, the
 * command as a JSON array. Plain fetch instead of @upstash/redis means no new
 * dependency, and it keeps Next's default fetch behaviour: the SDK opts out of
 * caching, which would turn the statically built home page dynamic.
 */
const responseSchema = z.union([
  z.object({ error: z.string() }),
  z.object({ result: z.unknown() }),
]);

export function isKvConfigured(): boolean {
  return Boolean(env.KV_REST_API_URL && env.KV_REST_API_TOKEN);
}

type KvArg = string | number;

async function command(
  args: readonly KvArg[],
  init: Pick<RequestInit, "cache"> = {},
): Promise<unknown> {
  const url = env.KV_REST_API_URL;
  const token = env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("KV is not configured");
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(args),
    ...init,
  });
  const parsed = responseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    throw new Error(`KV responded ${response.status} with an unexpected body`);
  }
  if ("error" in parsed.data) throw new Error(`KV error: ${parsed.data.error}`);
  return parsed.data.result;
}

/** The string stored at `key`, or null when it is missing. Throws on KV errors. */
export async function kvGet(key: string): Promise<string | null> {
  const result = await command(["GET", key]);
  return typeof result === "string" ? result : null;
}

export async function kvSet(key: string, value: string): Promise<void> {
  await command(["SET", key, value]);
}

/**
 * Any Redis command, never cached. Only for code that already runs per request
 * (server actions and the admin area, which reads cookies): in a public page
 * `no-store` would turn the statically built page dynamic (CLAUDE.md §8).
 */
export async function kvFresh(args: readonly KvArg[]): Promise<unknown> {
  return command(args, { cache: "no-store" });
}
