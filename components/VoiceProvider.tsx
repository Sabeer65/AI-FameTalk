"use client";

import React, { createContext, useContext, useState } from "react";
import Script from "next/script";

type VoiceStatus = "initializing" | "ready" | "error";

interface VoiceContextType {
  status: VoiceStatus;
}

const VoiceContext = createContext<VoiceContextType>({
  status: "initializing",
});

export const useVoice = () => useContext(VoiceContext);

export default function VoiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<VoiceStatus>("initializing");

  return (
    <VoiceContext.Provider value={{ status }}>
      <Script
        src={`https://code.responsivevoice.org/responsivevoice.js?key=${process.env.NEXT_PUBLIC_RESPONSIVEVOICE_KEY}`}
        strategy="afterInteractive"
        // This function runs ONLY if the script loads successfully
        onLoad={() => {
          console.log("ResponsiveVoice script loaded successfully.");
          setStatus("ready");
        }}
        // This function runs if the script fails to load (e.g., ad blocker, network error)
        onError={(e) => {
          console.error("Failed to load ResponsiveVoice script:", e);
          setStatus("error");
        }}
      />
      {children}
    </VoiceContext.Provider>
  );
}
