"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Task = {
  id: string;
  title: string;
  status: "TODO" | "COMPLETED";
};

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  async function load() {
    const response = await fetch("/api/tasks");
    const json = await response.json();
    setTasks(json.tasks ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createTask() {
    if (!title.trim()) {
      return;
    }

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    await load();
  }

  async function completeTask(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: true }),
    });
    await load();
  }

  return (
    <Card className="space-y-4">
      <div className="flex gap-2">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task" />
        <Button onClick={createTask}>Create</Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-zinc-500">No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <span className={task.status === "COMPLETED" ? "line-through opacity-70" : ""}>{task.title}</span>
              {task.status === "TODO" ? (
                <Button variant="secondary" onClick={() => completeTask(task.id)}>
                  <Check size={14} className="mr-1" />
                  Complete
                </Button>
              ) : (
                <span className="text-xs text-emerald-600">Done</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
