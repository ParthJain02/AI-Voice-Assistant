import OpenAI from "openai";
import { env } from "@/lib/validation/env";
import type { LlmProvider, StreamMessage } from "@/lib/ai/providers/base";

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export class OpenAiProvider implements LlmProvider {
  async streamText(messages: StreamMessage[]): Promise<ReadableStream<string>> {
    if (!client) {
      return new ReadableStream<string>({
        start(controller) {
          controller.enqueue("OpenAI key is not configured. Returning local fallback response.");
          controller.close();
        },
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      stream: true,
      temperature: 0.4,
    });

    return new ReadableStream<string>({
      async start(controller) {
        for await (const chunk of response) {
          const token = chunk.choices[0]?.delta?.content;
          if (token) {
            controller.enqueue(token);
          }
        }
        controller.close();
      },
    });
  }

  async completeJson<T>(messages: StreamMessage[], schemaHint: string): Promise<T | null> {
    void schemaHint;
    if (!client) {
      return null;
    }

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      messages,
      response_format: {
        type: "json_object",
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    try {
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }
}
