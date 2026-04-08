import { describe, expect, it, vi } from "vitest";
import { processDueReminders } from "@/lib/services/reminders";

const mocks = vi.hoisted(() => ({
  sendMock: vi.fn(async () => ({ ok: true, provider: "noop" })),
  findManyMock: vi.fn(async () => [] as Array<Record<string, unknown>>),
  updateManyMock: vi.fn(async () => ({ count: 1 })),
  createManyMock: vi.fn(async () => ({ count: 1 })),
  createMock: vi.fn(async () => ({ id: "log1" })),
  transactionMock: vi.fn(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
}));

vi.mock("@/lib/notifications/email", () => {
  return {
    getReminderEmailProvider: () => ({ send: mocks.sendMock }),
  };
});

vi.mock("@/lib/db/prisma", () => {
  return {
    prisma: {
      reminder: {
        findMany: mocks.findManyMock,
        updateMany: mocks.updateManyMock,
      },
      notification: {
        createMany: mocks.createManyMock,
        create: mocks.createMock,
      },
      eventLog: {
        createMany: mocks.createManyMock,
        create: mocks.createMock,
      },
      $transaction: mocks.transactionMock,
    },
  };
});

describe("processDueReminders", () => {
  it("marks due reminders as delivered", async () => {
    mocks.sendMock.mockClear();
    mocks.findManyMock.mockResolvedValueOnce([
      {
        id: "r1",
        userId: "u1",
        title: "Call mom",
        channel: "EMAIL",
        retryCount: 0,
        user: {
          email: "demo@voicepilot.dev",
          displayName: "Demo",
        },
      },
    ]);

    const result = await processDueReminders(new Date());

    expect(result.processed).toBe(1);
    expect(mocks.sendMock).toHaveBeenCalledTimes(1);
    expect(result.delivered).toBe(1);
    expect(result.retried).toBe(0);
    expect(result.failed).toBe(0);
  });

  it("schedules retry when email fails before max retries", async () => {
    mocks.sendMock.mockRejectedValueOnce(new Error("provider timeout"));
    mocks.findManyMock.mockResolvedValueOnce([
      {
        id: "r2",
        userId: "u2",
        title: "Submit taxes",
        channel: "EMAIL",
        retryCount: 1,
        user: {
          email: "retry@voicepilot.dev",
          displayName: "Retry User",
        },
      },
    ]);

    const result = await processDueReminders(new Date("2026-04-08T00:00:00Z"));

    expect(result.retried).toBe(1);
    expect(result.failed).toBe(0);
    expect(mocks.updateManyMock).toHaveBeenCalled();
  });

  it("marks reminder failed after max retries", async () => {
    mocks.sendMock.mockRejectedValueOnce(new Error("provider down"));
    mocks.findManyMock.mockResolvedValueOnce([
      {
        id: "r3",
        userId: "u3",
        title: "Critical alert",
        channel: "EMAIL",
        retryCount: 2,
        user: {
          email: "fail@voicepilot.dev",
          displayName: "Fail User",
        },
      },
    ]);

    const result = await processDueReminders(new Date("2026-04-08T00:00:00Z"));

    expect(result.failed).toBe(1);
    expect(mocks.createMock).toHaveBeenCalled();
  });
});
