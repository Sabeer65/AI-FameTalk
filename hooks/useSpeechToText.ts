// This is the full code for the file: hooks/useSpeechToText.ts
// It replaces the entire existing content of this file.

"use client";

import { useState, useEffect, useRef } from "react";

// Define the shape of the props the hook will accept
interface UseSpeechToTextOptions {
  onFinalTranscript: (transcript: string) => void;
}

// Extend the Window interface for speech recognition APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechToText = ({
  onFinalTranscript,
}: UseSpeechToTextOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (finalTranscript.trim()) {
        onFinalTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error(`Speech recognition error: ${event.error}`, event.message);
      setIsListening(false); // Ensure listening state is reset on error
    };

    recognition.onend = () => {
      // THE FIX: We no longer clear the interim transcript here.
      // The parent component will decide when to clear the input.
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [onFinalTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setInterimTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, interimTranscript, startListening, stopListening };
};
