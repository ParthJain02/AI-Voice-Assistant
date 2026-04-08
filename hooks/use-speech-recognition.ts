"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionConstructor = new () => {
  interimResults: boolean;
  continuous: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionState = {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
};

export function useSpeechRecognition() {
  const recognitionRef = useRef<InstanceType<SpeechRecognitionConstructor> | null>(null);
  const [state, setState] = useState<RecognitionState>({
    supported: false,
    listening: false,
    transcript: "",
    interimTranscript: "",
    error: null,
  });

  const getConstructor = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ||
      null
    );
  }, []);

  const start = useCallback(() => {
    if (!getConstructor) {
      setState((prev) => ({ ...prev, supported: false, error: "Speech recognition is not supported." }));
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new getConstructor();
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let final = "";
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const phrase = event.results[i][0]?.transcript ?? "";
          if (event.results[i].isFinal) {
            final += phrase;
          } else {
            interim += phrase;
          }
        }

        setState((prev) => ({
          ...prev,
          transcript: prev.transcript + final,
          interimTranscript: interim,
        }));
      };

      recognition.onerror = (event: { error: string }) => {
        setState((prev) => ({ ...prev, error: event.error, listening: false }));
      };

      recognition.onend = () => {
        setState((prev) => ({ ...prev, listening: false }));
      };

      recognitionRef.current = recognition;
    }

    setState((prev) => ({ ...prev, supported: true, listening: true, error: null }));
    recognitionRef.current.start();
  }, [getConstructor]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: "", interimTranscript: "" }));
  }, []);

  return {
    ...state,
    text: `${state.transcript} ${state.interimTranscript}`.trim(),
    start,
    stop,
    reset,
  };
}
