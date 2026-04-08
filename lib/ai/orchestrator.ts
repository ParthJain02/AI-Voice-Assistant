import { OpenAiProvider } from "@/lib/ai/providers/openai";
import { classifyIntent } from "@/lib/ai/tools/classifier";
import { executeIntent } from "@/lib/ai/tools/executor";
import { systemPrompt } from "@/lib/ai/prompt";

const provider = new OpenAiProvider();

export async function runAssistant(input: {
  userId: string;
  content: string;
  priorMessages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}) {
  const intentPayload = await classifyIntent(provider, input.content);
  const toolResult = await executeIntent(input.userId, intentPayload);

  const messages = [
    { role: "system" as const, content: systemPrompt(new Date().toISOString()) },
    ...input.priorMessages,
    {
      role: "system" as const,
      content:
        toolResult.intent === "CHAT"
          ? "No tool was run."
          : `Tool intent ${toolResult.intent} ran. Tool response: ${toolResult.response}`,
    },
    { role: "user" as const, content: input.content },
  ];

  const stream = await provider.streamText(messages);

  return {
    stream,
    intent: intentPayload.intent,
    toolResult,
  };
}
