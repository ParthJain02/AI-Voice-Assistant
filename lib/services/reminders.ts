import { ReminderStatus, ReminderChannel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { toUtcDate } from "@/lib/utils/date-time";
import { getReminderEmailProvider } from "@/lib/notifications/email";

const MAX_EMAIL_RETRIES = 3;
const BACKOFF_BASE_MINUTES = 2;

function nextBackoffDate(now: Date, retryCount: number) {
  const minutes = BACKOFF_BASE_MINUTES * 2 ** Math.max(retryCount - 1, 0);
  return new Date(now.getTime() + minutes * 60_000);
}

export async function createReminder(
  userId: string,
  title: string,
  remindAt: string,
  timezone: string,
  channel: ReminderChannel = ReminderChannel.IN_APP,
) {
  return prisma.reminder.create({
    data: {
      userId,
      title,
      timezone,
      remindAtUtc: toUtcDate(remindAt, timezone),
      channel,
    },
  });
}

export async function listReminders(userId: string) {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { remindAtUtc: "asc" },
  });
}

export async function processDueReminders(now = new Date()) {
  const emailProvider = getReminderEmailProvider();

  const due = await prisma.reminder.findMany({
    where: {
      status: ReminderStatus.PENDING,
      remindAtUtc: { lte: now },
    },
    include: {
      user: {
        select: {
          email: true,
          displayName: true,
        },
      },
    },
  });

  if (due.length === 0) {
    return { processed: 0 };
  }

  const delivered: Array<{ id: string; userId: string; title: string; channel: ReminderChannel }> = [];
  const retries: Array<{ id: string; userId: string; retryCount: number; remindAtUtc: Date; error: string }> = [];
  const failed: Array<{ id: string; userId: string; error: string }> = [];

  for (const item of due) {
    if (item.channel === ReminderChannel.IN_APP) {
      delivered.push({ id: item.id, userId: item.userId, title: item.title, channel: item.channel });
      continue;
    }

    try {
      const result = await emailProvider.send({
        to: item.user.email,
        subject: `Reminder: ${item.title}`,
        text: `Hi ${item.user.displayName}, this is your reminder: ${item.title}`,
      });

      if (result.ok) {
        delivered.push({ id: item.id, userId: item.userId, title: item.title, channel: item.channel });
        continue;
      }

      throw new Error("Email provider returned not ok");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown email delivery error";
      const nextRetryCount = item.retryCount + 1;

      if (nextRetryCount >= MAX_EMAIL_RETRIES) {
        failed.push({ id: item.id, userId: item.userId, error: errorMessage });
      } else {
        retries.push({
          id: item.id,
          userId: item.userId,
          retryCount: nextRetryCount,
          remindAtUtc: nextBackoffDate(now, nextRetryCount),
          error: errorMessage,
        });
      }
    }
  }

  const operations: Array<Promise<unknown>> = [];

  if (delivered.length > 0) {
    operations.push(
      prisma.reminder.updateMany({
        where: { id: { in: delivered.map((item) => item.id) } },
        data: { status: ReminderStatus.SENT, deliveredAt: now, lastError: null },
      }),
    );

    operations.push(
      prisma.notification.createMany({
        data: delivered.map((item) => ({
          userId: item.userId,
          type: "REMINDER",
          title: "Reminder due",
          body: item.channel === ReminderChannel.EMAIL ? `${item.title} (emailed)` : item.title,
        })),
      }),
    );

    operations.push(
      prisma.eventLog.createMany({
        data: delivered.map((item) => ({
          userId: item.userId,
          eventType: "REMINDER_DELIVERED",
          entityType: "Reminder",
          entityId: item.id,
          payload: { channel: item.channel },
        })),
      }),
    );
  }

  for (const retry of retries) {
    operations.push(
      prisma.reminder.updateMany({
        where: { id: retry.id },
        data: {
          status: ReminderStatus.PENDING,
          retryCount: retry.retryCount,
          remindAtUtc: retry.remindAtUtc,
          lastError: retry.error,
        },
      }),
    );

    operations.push(
      prisma.eventLog.create({
        data: {
          userId: retry.userId,
          eventType: "REMINDER_RETRY_SCHEDULED",
          entityType: "Reminder",
          entityId: retry.id,
          payload: { retryCount: retry.retryCount, nextRunAt: retry.remindAtUtc.toISOString(), error: retry.error },
        },
      }),
    );
  }

  for (const failure of failed) {
    operations.push(
      prisma.reminder.updateMany({
        where: { id: failure.id },
        data: {
          status: ReminderStatus.FAILED,
          lastError: failure.error,
        },
      }),
    );

    operations.push(
      prisma.notification.create({
        data: {
          userId: failure.userId,
          type: "SYSTEM",
          title: "Reminder delivery failed",
          body: "We could not deliver your email reminder after multiple attempts.",
        },
      }),
    );

    operations.push(
      prisma.eventLog.create({
        data: {
          userId: failure.userId,
          eventType: "REMINDER_FAILED",
          entityType: "Reminder",
          entityId: failure.id,
          payload: { error: failure.error },
        },
      }),
    );
  }

  if (operations.length > 0) {
    await Promise.all(operations);
  }

  return {
    processed: due.length,
    delivered: delivered.length,
    retried: retries.length,
    failed: failed.length,
  };
}
