import { describe, expect, it, vi } from "vitest";
import { isAuthorizedCronRequest } from "@/lib/cron";

const mockEnv = vi.hoisted(() => ({ CRON_SECRET: undefined as string | undefined }));
vi.mock("@/lib/env", () => ({ env: mockEnv }));

const SECRET = "s3cr3t-value-for-tests";

function request(authorization?: string): Request {
  return new Request("https://example.com/api/cron/refresh-instagram-token", {
    headers: authorization ? { authorization } : {},
  });
}

describe("isAuthorizedCronRequest", () => {
  it("fails closed when no CRON_SECRET is configured", () => {
    mockEnv.CRON_SECRET = undefined;
    expect(isAuthorizedCronRequest(request(`Bearer ${SECRET}`))).toBe(false);
  });

  it("accepts only the exact Bearer secret", () => {
    mockEnv.CRON_SECRET = SECRET;
    expect(isAuthorizedCronRequest(request(`Bearer ${SECRET}`))).toBe(true);
    expect(isAuthorizedCronRequest(request(SECRET))).toBe(false);
    expect(isAuthorizedCronRequest(request(`Bearer ${SECRET}x`))).toBe(false);
    expect(isAuthorizedCronRequest(request())).toBe(false);
  });
});
