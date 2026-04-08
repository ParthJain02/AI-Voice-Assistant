import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),
  APP_NAME: z.string().default("VoicePilot AI"),
  CRON_SECRET: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["noop", "resend"]).default("noop"),
  EMAIL_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
