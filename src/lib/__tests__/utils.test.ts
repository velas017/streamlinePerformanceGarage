import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  cn,
  formatDayRange,
  formatOpeningHours,
  formatPhone,
  formatTime,
  joinWithAnd,
  telHref,
} from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting tailwind classes, last wins", () => {
    expect(cn("p-2", "p-4", { hidden: false })).toBe("p-4");
  });
});

describe("absoluteUrl", () => {
  it("builds from the site url without trailing slash", () => {
    expect(absoluteUrl("/")).toBe("http://localhost:3000");
    expect(absoluteUrl("/services")).toBe("http://localhost:3000/services");
    expect(absoluteUrl("about")).toBe("http://localhost:3000/about");
  });
});

describe("phone helpers", () => {
  it("formats E.164 US numbers for display", () => {
    expect(formatPhone("+17045550101")).toBe("(704) 555-0101");
  });
  it("returns the raw value for non-US lengths", () => {
    expect(formatPhone("+4420")).toBe("+4420");
  });
  it("builds tel links", () => {
    expect(telHref("+17045550101")).toBe("tel:+17045550101");
  });
});

describe("hours helpers", () => {
  it("formats 24h to 12h", () => {
    expect(formatTime("08:00")).toBe("8:00 AM");
    expect(formatTime("12:30")).toBe("12:30 PM");
    expect(formatTime("00:15")).toBe("12:15 AM");
  });
  it("collapses consecutive days into a range", () => {
    expect(formatDayRange(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])).toBe(
      "Mon–Fri",
    );
    expect(formatDayRange(["Saturday"])).toBe("Sat");
    expect(formatDayRange(["Monday", "Wednesday"])).toBe("Mon, Wed");
  });
  it("adds a Closed row for uncovered days", () => {
    const rows = formatOpeningHours([
      {
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      { dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
    ]);
    expect(rows).toEqual([
      { days: "Mon–Fri", time: "8:00 AM – 6:00 PM" },
      { days: "Sat", time: "9:00 AM – 2:00 PM" },
      { days: "Sun", time: "Closed" },
    ]);
  });
});

describe("joinWithAnd", () => {
  it("joins naturally", () => {
    expect(joinWithAnd(["Concord"])).toBe("Concord");
    expect(joinWithAnd(["Concord", "Charlotte"])).toBe("Concord and Charlotte");
    expect(joinWithAnd(["A", "B", "C"])).toBe("A, B and C");
  });
});
