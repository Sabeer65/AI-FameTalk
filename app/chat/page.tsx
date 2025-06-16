"use client";

import React, { useEffect, useRef } from "react";
import ChatLayout from "@/components/ChatLayout";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSearchParams } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export default function ChatPage() {
  const searchParams = useSearchParams();
  const personaId = searchParams.get("persona");
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in animation for the chat layout
      gsap.from(".chat-container", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
      });

      // Parallax effect for background
      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".chat-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-[#1A1A2E] chat-section">
      <div className="absolute inset-0 parallax-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF3366]/10 to-[#1A1A2E]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="chat-container relative z-10 h-screen">
        <ChatLayout initialPersonaId={personaId || null} />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#FF3366] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-[#6C63FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-[#00F5FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}
