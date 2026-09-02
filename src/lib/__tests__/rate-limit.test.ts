import { beforeEach, describe, expect, it } from "vitest";
import { isRateLimited, resetRateLimiter } from "@/lib/rate-limit";

const options = { limit: 2, windowMs: 1000 };

describe("isRateLimited", () => {
  beforeEach(() => resetRateLimiter());

  it("allows up to the limit and blocks after", () => {
    expect(isRateLimited("a", options, 0)).toBe(false);
    expect(isRateLimited("a", options, 10)).toBe(false);
    expect(isRateLimited("a", options, 20)).toBe(true);
  });

  it("frees the slot once the window passes", () => {
    isRateLimited("b", options, 0);
    isRateLimited("b", options, 10);
    expect(isRateLimited("b", options, 1500)).toBe(false);
  });

  it("keys are independent", () => {
    isRateLimited("c", options, 0);
    isRateLimited("c", options, 0);
    expect(isRateLimited("d", options, 0)).toBe(false);
  });
});
