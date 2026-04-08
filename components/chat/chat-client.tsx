"use client";

import { useEffect, useMemo, useState } from "react";
import { Mic, MicOff, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};

type Props = {
  initialConversationId?: string;
  voiceEnabled: boolean;
  preferredVoice?: string | null;
  ttsRate: number;
  ttsPitch: number;
};

export function ChatClient({ initialConversationId, voiceEnabled, preferredVoice, ttsPitch, ttsRate }: Props) {
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const recognition = useSpeechRecognition();
  const { speak } = useSpeechSynthesis();

  async function loadConversations() {
    const response = await fetch("/api/conversations");
    const json = await response.json();
    setConversations(json.conversations ?? []);
  }

  async function loadConversation(id: string) {
    const response = await fetch(`/api/conversations/${id}`);
    const json = await response.json();
    const loaded = json.conversation;
    if (!loaded) {
      return;
    }

    setConversationId(id);
    setMessages(
      loaded.messages.map((message: { id: string; role: "USER" | "ASSISTANT"; content: string; createdAt: string }) => ({
        id: message.id,
        role: message.role === "USER" ? "user" : "assistant",
        content: message.content,
        createdAt: message.createdAt,
      })),
    );
  }

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (recognition.transcript) {
      setInput((prev) => `${prev} ${recognition.transcript}`.trim());
      recognition.reset();
    }
  }, [recognition]);

  const composedInput = useMemo(() => {
    return [input, recognition.interimTranscript].filter(Boolean).join(" ").trim();
  }, [input, recognition.interimTranscript]);

  async function sendMessage() {
    if (!composedInput || streaming) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: composedInput,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStreaming(true);

    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: composedInput }),
    });

    const id = response.headers.get("x-conversation-id") ?? undefined;
    if (id && !conversationId) {
      setConversationId(id);
      await loadConversations();
    }

    const reader = response.body?.getReader();
    if (!reader) {
      setStreaming(false);
      return;
    }

    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      text += decoder.decode(value, { stream: true });
      setMessages((prev) => {
        const draft = [...prev];
        const last = draft.at(-1);
        if (last?.role === "assistant") {
          last.content = text;
          return [...draft];
        }

        return [
          ...draft,
          {
            role: "assistant",
            content: text,
            createdAt: new Date().toISOString(),
          },
        ];
      });
    }

    if (voiceEnabled) {
      speak(text, {
        enabled: voiceEnabled,
        voiceName: preferredVoice,
        pitch: ttsPitch,
        rate: ttsRate,
      });
    }

    setStreaming(false);
    await loadConversations();
  }

  async function startNewConversation() {
    setConversationId(undefined);
    setMessages([]);
  }

  async function archiveConversation(id: string) {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (conversationId === id) {
      setConversationId(undefined);
      setMessages([]);
    }
    await loadConversations();
  }

  async function renameConversation() {
    if (!renamingId || !newTitle.trim()) {
      return;
    }

    await fetch(`/api/conversations/${renamingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    setRenamingId(null);
    setNewTitle("");
    await loadConversations();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="space-y-3 lg:h-[70vh] lg:overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Conversations</h2>
          <Button variant="secondary" onClick={startNewConversation}>
            <Plus size={14} className="mr-1" />
            New
          </Button>
        </div>
        {conversations.length === 0 ? (
          <p className="text-sm text-zinc-500">No conversation history yet.</p>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => loadConversation(conversation.id)}
                  className="w-full text-left text-sm font-medium"
                >
                  {conversation.title}
                </button>
                <div className="mt-2 flex gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRenamingId(conversation.id);
                      setNewTitle(conversation.title);
                    }}
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" onClick={() => archiveConversation(conversation.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {renamingId ? (
          <div className="space-y-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
            <Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
            <Button onClick={renameConversation}>Save name</Button>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
              Start by speaking or typing. Try: Remind me tomorrow at 7 PM to call mom.
            </p>
          ) : (
            messages.map((message, index) => (
              <div key={`${message.createdAt}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    message.role === "user"
                      ? "inline-block max-w-[80%] rounded-2xl bg-emerald-500 px-4 py-2 text-sm text-white"
                      : "inline-block max-w-[80%] rounded-2xl bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800"
                  }
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            value={composedInput}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Speak or type your request"
          />
          <div className="flex items-center gap-2">
            <Button onClick={sendMessage} disabled={streaming || !composedInput}>
              <Send size={16} className="mr-2" />
              {streaming ? "Streaming..." : "Send"}
            </Button>
            <Button
              variant="secondary"
              onClick={recognition.listening ? recognition.stop : recognition.start}
              type="button"
            >
              {recognition.listening ? <MicOff size={16} className="mr-2" /> : <Mic size={16} className="mr-2" />}
              {recognition.listening ? "Stop Listening" : "Start Listening"}
            </Button>
            {recognition.interimTranscript ? (
              <span className="text-xs text-zinc-500">Live transcript: {recognition.interimTranscript}</span>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
