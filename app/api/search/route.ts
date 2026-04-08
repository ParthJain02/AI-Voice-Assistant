import { requireSession } from "@/lib/auth/session";
import { searchMemory } from "@/lib/services/search";
import { toErrorResponse } from "@/lib/utils/errors";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const result = await searchMemory(session.user.id, q);
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
