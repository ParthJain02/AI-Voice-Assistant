import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis/client";
import { RateLimitError } from "@/lib/utils/errors";

const limiter =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "voicepilot:ratelimit",
  });

export async function enforceRateLimit(identifier: string) {
  if (!limiter) {
    return;
  }

  const result = await limiter.limit(identifier);

  if (!result.success) {
    throw new RateLimitError("Too many requests, please try again in a minute");
  }
}
