"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SpeechOptions = {
  enabled: boolean;
  voiceName?: string | null;
  rate?: number;
  pitch?: number;
};

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);

    return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);

  const speak = useCallback(
    (text: string, options: SpeechOptions) => {
      if (typeof window === "undefined" || !options.enabled || !text.trim()) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (options.voiceName) {
        utterance.voice = voices.find((v) => v.name === options.voiceName) ?? null;
      }
      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [voices],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
  }, []);

  return useMemo(
    () => ({
      voices,
      speak,
      stop,
    }),
    [voices, speak, stop],
  );
}
