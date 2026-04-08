import { redis } from "@/lib/redis/client";
import { processDueReminders } from "@/lib/services/reminders";
import { env } from "@/lib/validation/env";
import { toErrorResponse, UnauthorizedError } from "@/lib/utils/errors";

async function handleDueReminders(request: Request) {
  try {
    const auth = request.headers.get("authorization");
    if (env.CRON_SECRET && auth !== `Bearer ${env.CRON_SECRET}`) {
      throw new UnauthorizedError("Invalid cron secret");
    }

    const lockKey = "voicepilot:cron:reminders:lock";
    if (redis) {
      const acquired = await redis.set(lockKey, Date.now().toString(), {
        nx: true,
        ex: 55,
      });

      if (!acquired) {
        return Response.json({ skipped: true });
      }
    }

    const result = await processDueReminders();
    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  return handleDueReminders(request);
}

export async function GET(request: Request) {
  return handleDueReminders(request);
}
