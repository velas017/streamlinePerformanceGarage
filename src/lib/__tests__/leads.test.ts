import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/leads";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "(704) 555-0199",
  vehicle: "2004 Subaru WRX STI",
  location: "concord",
  service: "performance-tuning",
  message: "",
};

describe("leadSchema", () => {
  it("accepts a well-formed lead", () => {
    expect(leadSchema.safeParse(valid).success).toBe(true);
  });
  it("allows an empty phone but rejects garbage", () => {
    expect(leadSchema.safeParse({ ...valid, phone: "" }).success).toBe(true);
    expect(leadSchema.safeParse({ ...valid, phone: "call me" }).success).toBe(false);
  });
  it("rejects unknown locations and services", () => {
    expect(leadSchema.safeParse({ ...valid, location: "raleigh" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, service: "detailing" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, service: "other" }).success).toBe(true);
  });
});
