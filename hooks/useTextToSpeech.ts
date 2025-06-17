"use client";

import { useState, useCallback } from "react";
import { useVoice } from "@/components/VoiceProvider"; // Import the context hook

declare global {
  interface Window {
    responsiveVoice: {
      speak: (text: string, voice?: string, params?: object) => void;
      cancel: () => void;
      isPlaying: () => boolean;
    };
  }
}

export const useTextToSpeech = () => {
  const { status } = useVoice(); // Get the status from our provider
  const isAvailable = status === "ready";

  const speak = useCallback(
    (text: string, gender: "male" | "female" | "neutral" = "male") => {
      // Only speak if the service is ready
      if (!isAvailable || window.responsiveVoice.isPlaying()) return;

      let voice = "UK English Male";
      if (gender === "female") {
        voice = "UK English Female";
      }

      window.responsiveVoice.speak(text, voice);
    },
    [isAvailable],
  );

  const cancel = useCallback(() => {
    if (isAvailable) {
      window.responsiveVoice.cancel();
    }
  }, [isAvailable]);

  return { speak, cancel, isAvailable };
};
