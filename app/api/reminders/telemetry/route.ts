import { ReminderStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/utils/errors";

export async function GET() {
  try {
    const session = await requireSession();

    const [total, pending, sent, failed, recentEvents] = await Promise.all([
      prisma.reminder.count({ where: { userId: session.user.id } }),
      prisma.reminder.count({ where: { userId: session.user.id, status: ReminderStatus.PENDING } }),
      prisma.reminder.count({ where: { userId: session.user.id, status: ReminderStatus.SENT } }),
      prisma.reminder.count({ where: { userId: session.user.id, status: ReminderStatus.FAILED } }),
      prisma.eventLog.findMany({
        where: {
          userId: session.user.id,
          eventType: {
            in: ["REMINDER_DELIVERED", "REMINDER_RETRY_SCHEDULED", "REMINDER_FAILED"],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return Response.json({
      summary: {
        total,
        pending,
        sent,
        failed,
      },
      recentEvents,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
