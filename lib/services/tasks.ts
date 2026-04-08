import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function createTask(userId: string, title: string, notes?: string) {
  return prisma.task.create({
    data: {
      userId,
      title,
      notes,
    },
  });
}

export async function completeTask(userId: string, taskId: string) {
  const result = await prisma.task.updateMany({
    where: {
      id: taskId,
      userId,
    },
    data: {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  return result.count;
}

export async function listTasks(userId: string) {
  return prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
