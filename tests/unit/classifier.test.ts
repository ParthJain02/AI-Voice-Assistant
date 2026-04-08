import { describe, expect, it } from "vitest";
import { classifyIntent } from "@/lib/ai/tools/classifier";

const provider = {
  async streamText() {
    return new ReadableStream<string>();
  },
  async completeJson() {
    return null;
  },
};

describe("classifyIntent fallback", () => {
  it("detects reminder intent from natural language", async () => {
    const result = await classifyIntent(provider, "Remind me tomorrow at 7 PM to call mom");
    expect(result.intent).toBe("CREATE_REMINDER");
    expect(result.title?.toLowerCase()).toContain("call mom");
    expect(result.remindAt).toBeDefined();
    expect(result.timezone).toBeTruthy();
  });

  it("detects search intent", async () => {
    const result = await classifyIntent(provider, "search my previous message about taxes");
    expect(result.intent).toBe("SEARCH_MEMORY");
  });
});
