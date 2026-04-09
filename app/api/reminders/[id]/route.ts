import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { toErrorResponse, ValidationError } from "@/lib/utils/errors";
import { ReminderStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as { action?: string };
    const { id } = await params;

    if (body.action !== "retryNow") {
      throw new ValidationError("Unsupported reminder action");
    }

    const updated = await prisma.reminder.updateMany({
      where: {
        id,
        userId: session.user.id,
        status: ReminderStatus.FAILED,
      },
      data: {
        status: ReminderStatus.PENDING,
        remindAtUtc: new Date(),
        lastError: null,
      },
    });

    await prisma.eventLog.create({
      data: {
        userId: session.user.id,
        eventType: "REMINDER_MANUAL_RETRY",
        entityType: "Reminder",
        entityId: id,
        payload: { source: "dashboard" },
      },
    });

    return Response.json({ updated: updated.count });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await prisma.reminder.deleteMany({ where: { id, userId: session.user.id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
