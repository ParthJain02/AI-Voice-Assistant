import type { AssistantIntentPayload } from "@/lib/ai/tools/schemas";
import { createTask, completeTask } from "@/lib/services/tasks";
import { createReminder, listReminders } from "@/lib/services/reminders";
import { searchMemory } from "@/lib/services/search";

type ExecuteResult = {
  response: string;
  intent: AssistantIntentPayload["intent"];
};

export async function executeIntent(userId: string, payload: AssistantIntentPayload): Promise<ExecuteResult> {
  if (payload.intent === "CREATE_TASK" && payload.title) {
    const task = await createTask(userId, payload.title);
    return {
      intent: payload.intent,
      response: `Task created: ${task.title}`,
    };
  }

  if (payload.intent === "COMPLETE_TASK" && payload.taskId) {
    await completeTask(userId, payload.taskId);
    return {
      intent: payload.intent,
      response: "Task marked complete.",
    };
  }

  if (payload.intent === "CREATE_REMINDER" && payload.title && payload.remindAt && payload.timezone) {
    const reminder = await createReminder(
      userId,
      payload.title,
      payload.remindAt,
      payload.timezone,
      payload.channel ?? "IN_APP",
    );
    return {
      intent: payload.intent,
      response: `Reminder set for ${reminder.remindAtUtc.toISOString()} via ${reminder.channel}.`,
    };
  }

  if (payload.intent === "CREATE_REMINDER") {
    return {
      intent: payload.intent,
      response: "I could not detect a clear date and time. Try: Remind me tomorrow at 7 PM to call mom.",
    };
  }

  if (payload.intent === "LIST_REMINDERS") {
    const reminders = await listReminders(userId);
    return {
      intent: payload.intent,
      response:
        reminders.length === 0
          ? "You have no upcoming reminders."
          : reminders
              .slice(0, 5)
              .map((r: { title: string; remindAtUtc: Date }) => `- ${r.title} at ${r.remindAtUtc.toISOString()}`)
              .join("\n"),
    };
  }

  if (payload.intent === "SEARCH_MEMORY") {
    const query = payload.query || "";
    const result = await searchMemory(userId, query);
    return {
      intent: payload.intent,
      response: `Found ${result.tasks.length} tasks, ${result.reminders.length} reminders, and ${result.messages.length} messages for "${query}".`,
    };
  }

  return {
    intent: "CHAT",
    response: "",
  };
}
