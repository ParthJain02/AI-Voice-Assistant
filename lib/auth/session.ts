import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { UnauthorizedError } from "@/lib/utils/errors";

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  return session;
}
