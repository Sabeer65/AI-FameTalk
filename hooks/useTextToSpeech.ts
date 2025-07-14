// This is the full code for the file: hooks/useTextToSpeech.ts
// It replaces the entire existing content of this file.

"use client";

import { useVoice } from "@/components/VoiceProvider";

/**
 * A simple hook to provide direct access to the global voice context.
 * This can be used in components that need to trigger text-to-speech.
 */
const useTextToSpeech = () => {
  // Directly return the context provided by VoiceProvider.
  // This includes isReady, speak(text, gender), and cancel().
  return useVoice();
};

export default useTextToSpeech;
