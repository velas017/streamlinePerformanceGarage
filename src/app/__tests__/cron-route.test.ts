import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/cron/refresh-instagram-token/route";
import { isAuthorizedCronRequest } from "@/lib/cron";
import { refreshInstagramToken } from "@/lib/instagram-token";

vi.mock("@/lib/cron", () => ({ isAuthorizedCronRequest: vi.fn() }));
vi.mock("@/lib/instagram-token", () => ({ refreshInstagramToken: vi.fn() }));

const authorized = vi.mocked(isAuthorizedCronRequest);
const refresh = vi.mocked(refreshInstagramToken);
const request = new Request("https://example.com/api/cron/refresh-instagram-token");

describe("GET /api/cron/refresh-instagram-token", () => {
  beforeEach(() => {
    authorized.mockReset();
    refresh.mockReset();
  });

  it("rejects callers without the cron secret and does not refresh", async () => {
    authorized.mockReturnValue(false);
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("reports the refresh result", async () => {
    authorized.mockReturnValue(true);
    refresh.mockResolvedValue({ ok: true, expiresAt: "2026-12-25T09:00:00.000Z" });
    const ok = await GET(request);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true, expiresAt: "2026-12-25T09:00:00.000Z" });

    refresh.mockResolvedValue({ ok: false, error: "Meta refresh failed" });
    expect((await GET(request)).status).toBe(500);
  });
});
