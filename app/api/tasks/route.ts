import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { createTaskSchema } from "@/lib/validation/schemas";
import { toErrorResponse, ValidationError } from "@/lib/utils/errors";

export async function GET() {
  try {
    const session = await requireSession();
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ tasks });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
      },
    });

    return Response.json({ task }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
