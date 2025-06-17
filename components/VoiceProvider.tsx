"use client";

import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { createContext, ReactNode, useCallback } from "react";

interface VoiceContextType {
  isPlaying: boolean;
  speak: (options: {
    text: string;
    gender?: "male" | "female" | "neutral";
  }) => void;
  stop: () => void;
}

export const VoiceContext = createContext<VoiceContextType | null>(null);

export default function VoiceProvider({ children }: { children: ReactNode }) {
  const { isPlaying, speak: ttsSpeak, cancel: ttsCancel } = useTextToSpeech();

  const speak = useCallback(
    ({
      text,
      gender,
    }: {
      text: string;
      gender?: "male" | "female" | "neutral";
    }) => {
      ttsSpeak(text, gender);
    },
    [ttsSpeak],
  );

  const stop = useCallback(() => {
    ttsCancel();
  }, [ttsCancel]);

  const value = {
    isPlaying,
    speak,
    stop,
  };

  return (
    <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
  );
}
