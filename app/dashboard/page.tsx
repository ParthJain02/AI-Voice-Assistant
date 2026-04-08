import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <h2 className="text-lg font-semibold">Voice Chat</h2>
        <p className="mt-1 text-sm text-zinc-500">Talk to your assistant with real-time streaming responses.</p>
        <Link className="mt-4 inline-block text-sm font-medium text-emerald-600" href="/dashboard/chat">
          Open chat
        </Link>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Tasks</h2>
        <p className="mt-1 text-sm text-zinc-500">Capture and complete action items quickly.</p>
        <Link className="mt-4 inline-block text-sm font-medium text-emerald-600" href="/dashboard/tasks">
          Manage tasks
        </Link>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Reminders</h2>
        <p className="mt-1 text-sm text-zinc-500">Schedule reminders with timezone-aware delivery.</p>
        <Link className="mt-4 inline-block text-sm font-medium text-emerald-600" href="/dashboard/reminders">
          View reminders
        </Link>
      </Card>
    </div>
  );
}
