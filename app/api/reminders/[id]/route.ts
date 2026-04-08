import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/utils/errors";

type Params = { params: Promise<{ id: string }> };

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
