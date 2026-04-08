import { describe, expect, it } from "vitest";
import { parseReminderFromText } from "@/lib/ai/tools/reminder-parser";

describe("parseReminderFromText", () => {
  it("extracts title and remindAt from natural language", () => {
    const result = parseReminderFromText("Remind me tomorrow at 7 PM to call mom", new Date("2026-04-07T08:00:00Z"));

    expect(result.title.toLowerCase()).toContain("call mom");
    expect(result.remindAt).toBeDefined();
    expect(result.timezone).toBeTruthy();
  });

  it("returns fallback title when no date phrase exists", () => {
    const result = parseReminderFromText("Remind me to breathe");

    expect(result.title.toLowerCase()).toContain("breathe");
    expect(result.remindAt).toBeUndefined();
  });
});
