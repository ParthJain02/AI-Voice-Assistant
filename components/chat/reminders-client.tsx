"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Reminder = {
  id: string;
  title: string;
  remindAtUtc: string;
  deliveredAt: string | null;
  status: "PENDING" | "SENT" | "FAILED";
  channel: "IN_APP" | "EMAIL";
  retryCount: number;
  lastError: string | null;
};

export function RemindersClient() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [channel, setChannel] = useState<"IN_APP" | "EMAIL">("IN_APP");

  const upcoming = reminders.filter((item) => item.status === "PENDING");
  const history = reminders
    .filter((item) => item.status !== "PENDING")
    .sort((a, b) => {
      const aTime = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
      const bTime = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
      return bTime - aTime;
    });

  async function load() {
    const response = await fetch("/api/reminders");
    const json = await response.json();
    setReminders(json.reminders ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createReminder() {
    if (!title || !remindAt) {
      return;
    }

    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        remindAt,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        channel,
      }),
    });

    setTitle("");
    setRemindAt("");
    await load();
  }

  async function retryReminderNow(id: string) {
    await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "retryNow" }),
    });

    await load();
  }

  return (
    <Card className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Reminder title" />
        <Input type="datetime-local" value={remindAt} onChange={(event) => setRemindAt(event.target.value)} />
        <div className="flex gap-2">
          <select
            className="h-10 rounded-xl border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={channel}
            onChange={(event) => setChannel(event.target.value as "IN_APP" | "EMAIL")}
          >
            <option value="IN_APP">In-app</option>
            <option value="EMAIL">Email</option>
          </select>
          <Button onClick={createReminder}>Create reminder</Button>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-zinc-500">No upcoming reminders.</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((reminder) => (
            <li key={reminder.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{reminder.title}</p>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] dark:bg-zinc-800">{reminder.channel}</span>
              </div>
              <p className="text-xs text-zinc-500">Scheduled: {format(new Date(reminder.remindAtUtc), "PPpp")}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-2">
        <h3 className="text-sm font-semibold">Delivery History</h3>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No delivered reminders yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {history.map((item) => (
              <li key={item.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{item.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] dark:bg-zinc-800">{item.channel}</span>
                    <span
                      className={
                        item.status === "SENT"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }
                    >
                      {item.status}
                    </span>
                    {item.status === "FAILED" ? (
                      <Button variant="secondary" onClick={() => retryReminderNow(item.id)}>
                        Retry now
                      </Button>
                    ) : null}
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  Delivered: {item.deliveredAt ? format(new Date(item.deliveredAt), "PPpp") : "Not delivered"}
                </p>
                <p className="text-xs text-zinc-500">Retries: {item.retryCount}</p>
                {item.lastError ? <p className="text-xs text-amber-600 dark:text-amber-300">Last error: {item.lastError}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
