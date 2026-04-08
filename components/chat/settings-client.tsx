"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SettingsState = {
  displayName: string;
  voiceEnabled: boolean;
  preferredVoice: string;
};

export function SettingsClient() {
  const [state, setState] = useState<SettingsState>({
    displayName: "",
    voiceEnabled: true,
    preferredVoice: "",
  });

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/settings");
      const json = await response.json();
      setState({
        displayName: json.user?.displayName ?? "",
        voiceEnabled: json.settings?.voiceEnabled ?? true,
        preferredVoice: json.settings?.preferredVoice ?? "",
      });
    }

    void load();
  }, []);

  async function save() {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  }

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm">Display name</label>
        <Input
          value={state.displayName}
          onChange={(event) => setState((prev) => ({ ...prev, displayName: event.target.value }))}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
        <div>
          <p className="text-sm font-medium">Voice output</p>
          <p className="text-xs text-zinc-500">Speak assistant responses aloud</p>
        </div>
        <input
          type="checkbox"
          checked={state.voiceEnabled}
          onChange={(event) => setState((prev) => ({ ...prev, voiceEnabled: event.target.checked }))}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Preferred browser voice</label>
        <Input
          value={state.preferredVoice}
          onChange={(event) => setState((prev) => ({ ...prev, preferredVoice: event.target.value }))}
          placeholder="e.g. Google US English"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={save}>Save settings</Button>
        <Button variant="destructive">Delete account (placeholder)</Button>
      </div>
    </Card>
  );
}
