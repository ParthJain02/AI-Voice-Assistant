import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/utils/errors";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { id } = await params;

    const task = await prisma.task.updateMany({
      where: { id, userId: session.user.id },
      data: {
        status: body.complete ? TaskStatus.COMPLETED : TaskStatus.TODO,
        completedAt: body.complete ? new Date() : null,
      },
    });

    return Response.json({ updated: task.count });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await prisma.task.deleteMany({ where: { id, userId: session.user.id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
