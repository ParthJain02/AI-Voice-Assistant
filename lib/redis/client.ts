import { Redis } from "@upstash/redis";
import { env } from "@/lib/validation/env";

export const redis =
  env.REDIS_URL && env.REDIS_TOKEN
    ? new Redis({
        url: env.REDIS_URL,
        token: env.REDIS_TOKEN,
      })
    : null;
