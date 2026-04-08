import Link from "next/link";
import { Mic, Sparkles, BellRing, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#ffe4bf,transparent_40%),radial-gradient(circle_at_85%_0%,#c6ffe8,transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_20%,#46351d,transparent_40%),radial-gradient(circle_at_85%_0%,#153d31,transparent_35%)]" />
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-24 lg:px-8">
        <div className="animate-fade-slide space-y-6 text-center">
          <p className="mx-auto w-fit rounded-full border border-zinc-300 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
            Voice-first personal assistant
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Speak naturally. Capture tasks. Never miss a reminder.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-zinc-600 dark:text-zinc-300 sm:text-lg">
            VoicePilot AI combines real-time voice transcription, streaming AI responses, and productivity tooling in one polished workspace.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Sign in</Button>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card>
            <Mic className="mb-2" size={18} />
            <h3 className="font-semibold">Live voice capture</h3>
            <p className="mt-1 text-sm text-zinc-500">Push-to-talk with live transcript and automatic response playback.</p>
          </Card>
          <Card>
            <Sparkles className="mb-2" size={18} />
            <h3 className="font-semibold">AI tool routing</h3>
            <p className="mt-1 text-sm text-zinc-500">Assistant intent routing for tasks, reminders, chat, and memory search.</p>
          </Card>
          <Card>
            <BellRing className="mb-2" size={18} />
            <h3 className="font-semibold">Reminder engine</h3>
            <p className="mt-1 text-sm text-zinc-500">Timezone-aware reminders with background due processing.</p>
          </Card>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
          <ShieldCheck size={16} className="mr-2 inline" />
          Built with Auth.js, Prisma, PostgreSQL, Redis, and provider-based LLM orchestration.
        </div>
      </section>
    </main>
  );
}
