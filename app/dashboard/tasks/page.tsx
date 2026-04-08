import { TasksClient } from "@/components/chat/tasks-client";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <TasksClient />
    </div>
  );
}
