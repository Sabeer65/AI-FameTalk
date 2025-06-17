"use client";

import { useState, useEffect, useCallback } from "react";

export const useTextToSpeech = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsAvailable(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
  }, []);

  const speak = useCallback(
    (text: string, gender: "male" | "female" | "neutral" = "female") => {
      if (!isAvailable || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (gender === "male") {
        selectedVoice = voices.find(
          (voice) =>
            voice.name.includes("Google") &&
            voice.name.includes("Male") &&
            voice.lang.startsWith("en"),
        );
      } else {
        selectedVoice = voices.find(
          (voice) =>
            voice.name.includes("Google") &&
            voice.name.includes("Female") &&
            voice.lang.startsWith("en"),
        );
      }

      if (!selectedVoice) {
        selectedVoice = voices.find(
          (voice) =>
            voice.name.includes("Google") && voice.lang.startsWith("en"),
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        console.error("SpeechSynthesisUtterance.onerror");
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isAvailable],
  );

  const cancel = useCallback(() => {
    if (!isAvailable) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [isAvailable]);

  return { speak, cancel, isAvailable, isPlaying };
};
