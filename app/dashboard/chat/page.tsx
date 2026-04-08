import { getServerSession } from "next-auth";
import { ChatClient } from "@/components/chat/chat-client";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  const settings = session?.user?.id
    ? await prisma.userSettings.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Assistant Chat</h1>
      <ChatClient
        voiceEnabled={settings?.voiceEnabled ?? true}
        preferredVoice={settings?.preferredVoice}
        ttsPitch={settings?.ttsPitch ?? 1}
        ttsRate={settings?.ttsRate ?? 1}
      />
    </div>
  );
}
