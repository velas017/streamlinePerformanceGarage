/**
 * Minimal in-memory sliding-window limiter for the contact form. Per server
 * instance only; swap the store for Redis/Upstash if the site runs on multiple
 * instances and abuse becomes a problem.
 */
const hits = new Map<string, number[]>();

export interface RateLimitOptions {
  readonly limit: number;
  readonly windowMs: number;
}

export function isRateLimited(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  now = Date.now(),
): boolean {
  const cutoff = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [storedKey, timestamps] of hits) {
      if (timestamps.every((timestamp) => timestamp <= cutoff)) hits.delete(storedKey);
    }
  }
  return false;
}

/** Test-only helper. */
export function resetRateLimiter(): void {
  hits.clear();
}
