import { z } from "zod";

export const assistantIntentSchema = z.enum([
  "CHAT",
  "CREATE_TASK",
  "COMPLETE_TASK",
  "CREATE_REMINDER",
  "LIST_REMINDERS",
  "SEARCH_MEMORY",
]);

export const intentPayloadSchema = z.object({
  intent: assistantIntentSchema,
  title: z.string().optional(),
  taskId: z.string().optional(),
  query: z.string().optional(),
  remindAt: z.string().optional(),
  timezone: z.string().optional(),
  channel: z.enum(["IN_APP", "EMAIL"]).optional(),
});

export type AssistantIntentPayload = z.infer<typeof intentPayloadSchema>;
