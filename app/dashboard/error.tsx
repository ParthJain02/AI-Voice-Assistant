"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-1 text-sm">Please retry the action.</p>
      <Button className="mt-3" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
