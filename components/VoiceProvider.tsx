// This is the full code for the file: components/VoiceProvider.tsx
// It replaces the entire existing content of this file.

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// Define the shape of optional callbacks for the speak function
interface SpeakCallbacks {
  onstart?: () => void;
  onend?: () => void;
}

// Define the context shape
interface VoiceContextType {
  isReady: boolean;
  isSpeaking: boolean;
  speak: (
    text: string,
    gender: "male" | "female" | "neutral",
    callbacks?: SpeakCallbacks,
  ) => void;
  cancel: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
};

export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Browser Speech Synthesis not supported.");
      return;
    }

    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setIsReady(true);
        console.log("Browser TTS is ready.");
        window.speechSynthesis.onvoiceschanged = null;
      }
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (
      text: string,
      gender: "male" | "female" | "neutral" = "male",
      callbacks?: SpeakCallbacks,
    ) => {
      if (!isReady) return;

      // Stop any currently playing speech before starting a new one
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (gender === "female"
            ? v.name.includes("Female") || v.name.includes("Zira")
            : v.name.includes("Male") || v.name.includes("David")),
      );

      utterance.voice =
        preferredVoice || voices.find((v) => v.lang.startsWith("en")) || null;

      // Wire up the state and callbacks
      utterance.onstart = () => {
        setIsSpeaking(true);
        callbacks?.onstart?.();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        callbacks?.onend?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        callbacks?.onend?.(); // Also treat error as the end
      };

      window.speechSynthesis.speak(utterance);
    },
    [isReady, voices],
  );

  const cancel = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const value = { isReady, isSpeaking, speak, cancel };

  return (
    <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
  );
};
