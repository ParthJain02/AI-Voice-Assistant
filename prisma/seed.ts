import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("DemoPass123!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@voicepilot.dev" },
    update: {},
    create: {
      email: "demo@voicepilot.dev",
      displayName: "Demo User",
      passwordHash,
      timezone: "UTC",
      settings: {
        create: {
          voiceEnabled: true,
        },
      },
    },
  });

  await prisma.task.createMany({
    data: [
      { userId: user.id, title: "Prepare weekly review" },
      { userId: user.id, title: "Book dentist appointment" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
