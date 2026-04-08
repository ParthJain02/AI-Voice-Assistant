import { intentPayloadSchema, type AssistantIntentPayload } from "@/lib/ai/tools/schemas";
import type { LlmProvider } from "@/lib/ai/providers/base";
import { parseReminderFromText } from "@/lib/ai/tools/reminder-parser";

function detectReminderChannel(input: string): "IN_APP" | "EMAIL" {
  const text = input.toLowerCase();
  if (text.includes("email me") || text.includes("send me an email") || text.includes("mail me")) {
    return "EMAIL";
  }
  return "IN_APP";
}

function regexFallback(input: string): AssistantIntentPayload {
  const text = input.toLowerCase();

  if (text.includes("remind me")) {
    const parsedReminder = parseReminderFromText(input);
    return {
      intent: "CREATE_REMINDER",
      title: parsedReminder.title,
      remindAt: parsedReminder.remindAt,
      timezone: parsedReminder.timezone,
      channel: detectReminderChannel(input),
    };
  }

  if (text.includes("create task") || text.startsWith("task ") || text.includes("todo")) {
    return {
      intent: "CREATE_TASK",
      title: input.replace(/create task|todo|task/gi, "").trim() || input,
    };
  }

  if (text.includes("complete task")) {
    return {
      intent: "COMPLETE_TASK",
      taskId: input.split(" ").at(-1),
    };
  }

  if (text.includes("list reminders") || text.includes("upcoming reminder")) {
    return { intent: "LIST_REMINDERS" };
  }

  if (text.includes("search") || text.includes("find")) {
    return {
      intent: "SEARCH_MEMORY",
      query: input,
    };
  }

  return { intent: "CHAT" };
}

export async function classifyIntent(provider: LlmProvider, input: string): Promise<AssistantIntentPayload> {
  const llmResult = await provider.completeJson<AssistantIntentPayload>(
    [
      {
        role: "system",
        content:
          "Classify user input into intent and parameters. Return JSON with keys: intent,title,taskId,query,remindAt,timezone. Valid intent values: CHAT,CREATE_TASK,COMPLETE_TASK,CREATE_REMINDER,LIST_REMINDERS,SEARCH_MEMORY.",
      },
      { role: "user", content: input },
    ],
    "assistant intent payload",
  );

  const parsed = intentPayloadSchema.safeParse(llmResult);
  if (parsed.success) {
    if (parsed.data.intent === "CREATE_REMINDER") {
      const parsedReminder = parseReminderFromText(input);

      return {
        ...parsed.data,
        title: parsed.data.title ?? parsedReminder.title,
        remindAt: parsed.data.remindAt ?? parsedReminder.remindAt,
        timezone: parsed.data.timezone ?? parsedReminder.timezone,
        channel: parsed.data.channel ?? detectReminderChannel(input),
      };
    }

    return parsed.data;
  }

  return regexFallback(input);
}
