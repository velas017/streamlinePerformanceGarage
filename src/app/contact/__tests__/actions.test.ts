import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

describe('contact actions ("use server")', () => {
  it("exports only async functions, or Next.js rejects every submission", async () => {
    const actions: Record<string, unknown> = await import("@/app/contact/actions");
    const exported = Object.entries(actions);
    expect(exported.length).toBeGreaterThan(0);
    for (const [name, value] of exported) {
      expect(
        typeof value === "function" && value.constructor.name === "AsyncFunction",
        `${name} must be an async function`,
      ).toBe(true);
    }
  });
});
