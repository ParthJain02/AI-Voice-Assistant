import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { createReminderSchema } from "@/lib/validation/schemas";
import { toErrorResponse, ValidationError } from "@/lib/utils/errors";
import { toUtcDate } from "@/lib/utils/date-time";

export async function GET() {
  try {
    const session = await requireSession();
    const reminders = await prisma.reminder.findMany({
      where: { userId: session.user.id },
      orderBy: { remindAtUtc: "asc" },
    });

    return Response.json({ reminders });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = createReminderSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        timezone: parsed.data.timezone,
        remindAtUtc: toUtcDate(parsed.data.remindAt, parsed.data.timezone),
        channel: parsed.data.channel,
      },
    });

    return Response.json({ reminder }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
