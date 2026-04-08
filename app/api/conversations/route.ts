import { requireSession } from "@/lib/auth/session";
import { createConversation, listConversations } from "@/lib/services/conversations";
import { toErrorResponse } from "@/lib/utils/errors";

export async function GET() {
  try {
    const session = await requireSession();
    const conversations = await listConversations(session.user.id);
    return Response.json({ conversations });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST() {
  try {
    const session = await requireSession();
    const conversation = await createConversation(session.user.id);
    return Response.json({ conversation }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
