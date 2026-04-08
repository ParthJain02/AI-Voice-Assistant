import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { updateSettingsSchema } from "@/lib/validation/schemas";
import { toErrorResponse, ValidationError } from "@/lib/utils/errors";

export async function GET() {
  try {
    const session = await requireSession();
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id }, select: { displayName: true, timezone: true, email: true } }),
      prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
    ]);

    return Response.json({ user, settings });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const data = parsed.data;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (data.displayName) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { displayName: data.displayName },
        });
      }

      const settings = await tx.userSettings.upsert({
        where: { userId: session.user.id },
        update: {
          voiceEnabled: data.voiceEnabled,
          preferredVoice: data.preferredVoice === undefined ? undefined : data.preferredVoice,
          theme: data.theme,
          ttsRate: data.ttsRate,
          ttsPitch: data.ttsPitch,
        },
        create: {
          userId: session.user.id,
          voiceEnabled: data.voiceEnabled ?? true,
          preferredVoice: data.preferredVoice ?? null,
          theme: data.theme ?? "SYSTEM",
          ttsRate: data.ttsRate ?? 1,
          ttsPitch: data.ttsPitch ?? 1,
        },
      });

      return settings;
    });

    return Response.json({ settings: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
