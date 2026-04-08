import { prisma } from "@/lib/db/prisma";

export async function searchMemory(userId: string, query: string) {
  const [tasks, reminders, messages] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        OR: [{ title: { contains: query, mode: "insensitive" } }, { notes: { contains: query, mode: "insensitive" } }],
      },
      take: 5,
    }),
    prisma.reminder.findMany({
      where: {
        userId,
        title: { contains: query, mode: "insensitive" },
      },
      take: 5,
    }),
    prisma.message.findMany({
      where: {
        conversation: { userId },
        content: { contains: query, mode: "insensitive" },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { tasks, reminders, messages };
}
