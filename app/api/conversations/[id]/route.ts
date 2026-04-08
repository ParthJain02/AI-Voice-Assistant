import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/utils/errors";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" } },
      },
    });

    return Response.json({ conversation });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await request.json();

    const conversation = await prisma.conversation.updateMany({
      where: { id, userId: session.user.id },
      data: { title: body.title ?? "Untitled" },
    });

    return Response.json({ updated: conversation.count });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;

    await prisma.conversation.updateMany({
      where: { id, userId: session.user.id },
      data: { archivedAt: new Date() },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
