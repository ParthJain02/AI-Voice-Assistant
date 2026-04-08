import { hash } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { signupSchema } from "@/lib/validation/schemas";
import { toErrorResponse, ValidationError } from "@/lib/utils/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) {
      throw new ValidationError("Email is already registered");
    }

    const passwordHash = await hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        displayName: parsed.data.displayName,
        settings: {
          create: {},
        },
      },
      select: { id: true, email: true, displayName: true },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
