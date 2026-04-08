import { prisma } from "@/lib/db/prisma";
import { MessageRole } from "@prisma/client";

export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { userId, archivedAt: null },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createConversation(userId: string, title = "New conversation") {
  return prisma.conversation.create({
    data: {
      userId,
      title,
    },
  });
}

export async function getConversationWithMessages(userId: string, conversationId: string) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function addMessage(conversationId: string, role: MessageRole, content: string, toolIntent?: string) {
  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      toolIntent,
    },
  });
}
