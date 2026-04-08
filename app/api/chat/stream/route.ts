import { MessageRole } from "@prisma/client";
import { requireSession } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/redis/rate-limit";
import { prisma } from "@/lib/db/prisma";
import { addMessage, createConversation, getConversationWithMessages } from "@/lib/services/conversations";
import { runAssistant } from "@/lib/ai/orchestrator";
import { toErrorResponse, ValidationError } from "@/lib/utils/errors";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    await enforceRateLimit(`chat:${session.user.id}`);

    const body = (await request.json()) as { conversationId?: string; content?: string };
    if (!body.content || body.content.trim().length === 0) {
      throw new ValidationError("Message content is required");
    }

    let conversationId = "";
    let prior: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (body.conversationId) {
      const existingConversation = await getConversationWithMessages(session.user.id, body.conversationId);
      if (!existingConversation) {
        throw new ValidationError("Conversation not found");
      }

      conversationId = existingConversation.id;
      prior = existingConversation.messages.map((message) => ({
        role: message.role === MessageRole.USER ? "user" : "assistant",
        content: message.content,
      }));
    } else {
      const createdConversation = await createConversation(session.user.id, body.content.slice(0, 42));
      conversationId = createdConversation.id;
    }

    await addMessage(conversationId, MessageRole.USER, body.content);

    const assistant = await runAssistant({
      userId: session.user.id,
      content: body.content,
      priorMessages: prior.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const reader = assistant.stream.getReader();
    let fullText = "";

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          await addMessage(conversationId, MessageRole.ASSISTANT, fullText, assistant.intent);
          controller.close();
          return;
        }

        const text = value;
        fullText += text;
        controller.enqueue(encoder.encode(text));
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": conversationId,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
