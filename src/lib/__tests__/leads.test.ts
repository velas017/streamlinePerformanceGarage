import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { asksForShop, deliverLead, leadEmail, leadSchema } from "@/lib/leads";
import { siteConfig } from "@/lib/site-config";

const mockEnv = vi.hoisted(() => ({
  RESEND_API_KEY: undefined as string | undefined,
  VERCEL_ENV: undefined as "production" | "preview" | "development" | undefined,
  NODE_ENV: "test" as "development" | "test" | "production",
}));
vi.mock("@/lib/env", () => ({ env: mockEnv }));

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "(704) 555-0199",
  vehicle: "2004 Subaru WRX STI",
  location: "concord",
  service: "performance-tuning",
  message: "",
};
const lead = leadSchema.parse(valid);

describe("leadSchema", () => {
  it("accepts a well-formed lead", () => {
    expect(leadSchema.safeParse(valid).success).toBe(true);
  });
  it("allows an empty phone but rejects garbage", () => {
    expect(leadSchema.safeParse({ ...valid, phone: "" }).success).toBe(true);
    expect(leadSchema.safeParse({ ...valid, phone: "call me" }).success).toBe(false);
  });
  it("rejects unknown services", () => {
    expect(leadSchema.safeParse({ ...valid, service: "detailing" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, service: "other" }).success).toBe(true);
  });
  it("files every lead under the one shop, since the form does not ask", () => {
    expect(asksForShop).toBe(false);
    expect(leadSchema.parse({ ...valid, location: "" }).location).toBe("concord");
    expect(leadSchema.parse({ ...valid, location: "raleigh" }).location).toBe("concord");
  });
});

const fetchMock = vi.fn(async (_input: string | URL, _init?: RequestInit) =>
  Response.json({ id: "email-id" }),
);

beforeEach(() => {
  Object.assign(mockEnv, {
    RESEND_API_KEY: "re_test",
    VERCEL_ENV: "production",
    NODE_ENV: "production",
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockClear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("leadEmail", () => {
  it("goes to the shop's inbox from the verified sender, replying to the customer", () => {
    const email = leadEmail(lead);
    expect(email.to).toEqual([siteConfig.email]);
    expect(email.from).toContain(`<${siteConfig.leadSenderEmail}>`);
    expect(email.reply_to).toBe("ada@example.com");
    expect(email.subject).toBe("Booking request: Ada Lovelace, 2004 Subaru WRX STI");
  });

  it("shows the same labels and choices the visitor saw on the form", () => {
    const { text } = leadEmail({ ...lead, phone: "" });
    expect(text).not.toContain("Preferred shop");
    expect(text).toContain("Service: Performance ECU Tuning");
    expect(text).toContain("Phone: Not given");
    expect(text).toContain("Details:\nNone");
  });

  it("marks anything but the live site as a test", () => {
    mockEnv.VERCEL_ENV = "preview";
    expect(leadEmail(lead).subject).toMatch(/^\[Test\] Booking request/);
  });

  it("keeps the subject on one line", () => {
    expect(leadEmail({ ...lead, name: "Ada\r\nBcc: x@example.com" }).subject).toBe(
      "Booking request: Ada Bcc: x@example.com, 2004 Subaru WRX STI",
    );
  });
});

describe("deliverLead", () => {
  it("sends the email through Resend with the API key", async () => {
    await deliverLead(lead);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://api.resend.com/emails");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer re_test");
    expect(JSON.parse(String(init?.body))).toEqual(leadEmail(lead));
  });

  it("sends the same request with the same idempotency key, so it arrives once", async () => {
    await deliverLead(lead);
    await deliverLead(lead);
    await deliverLead({ ...lead, message: "Also the brakes" });
    const keys = fetchMock.mock.calls.map(([, init]) =>
      new Headers(init?.headers).get("idempotency-key"),
    );
    expect(keys[0]).toMatch(/^booking-request\/[0-9a-f]{64}$/);
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).not.toBe(keys[0]);
  });

  it("throws when Resend rejects the email, so the form shows the phone number", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ message: "The domain is not verified" }, { status: 403 }),
    );
    await expect(deliverLead(lead)).rejects.toThrow(
      "Resend responded 403: The domain is not verified",
    );
  });

  it("throws in production without a key instead of dropping the lead", async () => {
    mockEnv.RESEND_API_KEY = undefined;
    await expect(deliverLead(lead)).rejects.toThrow("RESEND_API_KEY is not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs the lead locally in development without a key", async () => {
    Object.assign(mockEnv, { RESEND_API_KEY: undefined, NODE_ENV: "development" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await deliverLead(lead);
    expect(warn).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
