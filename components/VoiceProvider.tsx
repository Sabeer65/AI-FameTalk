// This is the full code for the file: components/VoiceProvider.tsx
// It replaces the entire existing content of this file.

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Define the shape of the ResponsiveVoice object
interface ResponsiveVoice {
  speak: (text: string, voice?: string, options?: any) => void;
  cancel: () => void;
  isPlaying: () => boolean;
  setDefaultVoice: (voice: string) => void;
  // This is a special property we can set to know when the library is ready
  OnVoiceReady?: () => void;
}

// Extend the Window interface
declare global {
  interface Window {
    responsiveVoice: ResponsiveVoice;
  }
}

// Define the context shape
interface VoiceContextType {
  isSpeaking: boolean;
  isReady: boolean;
  speak: (text: string, voice?: string) => void;
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

const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // --- This effect handles loading the external script ---

    // Check if the script is already loaded to avoid duplicates
    if (document.getElementById("responsivevoice-script")) {
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "responsivevoice-script";
    // IMPORTANT: Replace with your actual ResponsiveVoice API Key
    script.src = `https://code.responsivevoice.org/responsivevoice.js?key=ZxTNcwhE`;
    script.async = true;

    // The official way to know when ResponsiveVoice is loaded and ready
    script.onload = () => {
      // The OnVoiceReady event fires when the voices have been loaded.
      if (window.responsiveVoice) {
        window.responsiveVoice.OnVoiceReady = () => {
          console.log("ResponsiveVoice is ready.");
          setIsReady(true);
        };
      }
    };

    script.onerror = () => {
      console.error("Failed to load the ResponsiveVoice script.");
      setIsReady(false);
    };

    document.head.appendChild(script);

    return () => {
      // Optional: Cleanup the script when the provider is unmounted
      const scriptElement = document.getElementById("responsivevoice-script");
      if (scriptElement) {
        // You might choose to leave it loaded for performance on subsequent page loads
        // document.head.removeChild(scriptElement);
      }
    };
  }, []);

  const speak = (text: string, voice = "UK English Female") => {
    if (isReady && !isSpeaking) {
      window.responsiveVoice.speak(text, voice, {
        onstart: () => setIsSpeaking(true),
        onend: () => setIsSpeaking(false),
      });
    } else if (!isReady) {
      console.warn("Voice service is not ready yet.");
    }
  };

  const cancel = () => {
    if (isReady && isSpeaking) {
      window.responsiveVoice.cancel();
      setIsSpeaking(false);
    }
  };

  const value = { isSpeaking, isReady, speak, cancel };

  return (
    <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
  );
};

export default VoiceProvider;
