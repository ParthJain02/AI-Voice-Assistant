import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/utils/errors";

export async function GET() {
  try {
    const session = await requireSession();
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return Response.json({ notifications });
  } catch (error) {
    return toErrorResponse(error);
  }
}
