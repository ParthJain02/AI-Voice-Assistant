import { describe, expect, it } from "vitest";
import { toUtcDate } from "@/lib/utils/date-time";

describe("toUtcDate", () => {
  it("converts timezone date string to UTC date", () => {
    const date = toUtcDate("2026-04-07T19:00", "Asia/Kolkata");
    expect(date.toISOString()).toMatch(/^2026-04-07T13:30:00/);
  });
});
