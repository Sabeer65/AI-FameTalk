"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Persona from "@/models/Persona";
import dbConnect from "@/lib/dbConnect";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, TextPlugin, SplitText);

interface IPersona {
  _id: string;
  name: string;
  description: string;
  systemPrompt: string;
  category: string;
  imageUrl: string;
  creatorId: string;
  isDefault: boolean;
}

export default function PersonasPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [personas, setPersonas] = useState<IPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        await dbConnect();
        const response = await fetch("/api/personas");
        const data = await response.json();
        setPersonas(data);
      } catch (error) {
        console.error("Error fetching personas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      const title = new SplitText(titleRef.current, { type: "chars" });
      gsap.from(title.chars, {
        opacity: 0,
        y: 50,
        rotateX: -90,
        stagger: 0.02,
        duration: 0.8,
        ease: "back.out(1.7)",
      });

      // Subtitle animation
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.5,
      });

      // Persona cards animation
      gsap.utils.toArray(".persona-card").forEach((card: any, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          y: 50,
          duration: 0.8,
          delay: i * 0.1,
        });
      });

      // Parallax effect
      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".personas-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, [personas]);

  const handleCreatePersona = () => {
    router.push("/personas/create");
  };

  return (
    <div ref={mainRef} className="min-h-screen bg-[#1A1A2E] personas-section">
      <div className="absolute inset-0 parallax-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF3366]/10 to-[#1A1A2E]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF3366] to-[#6C63FF]"
          >
            Persona Library
          </h1>
          <p
            ref={subtitleRef}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Explore our collection of AI personas or create your own custom
            character to chat with.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF3366]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personas.map((persona) => (
              <div
                key={persona._id}
                className="persona-card bg-[#1A1A2E]/80 backdrop-blur-lg rounded-2xl p-6 border border-[#FF3366]/20 hover:border-[#FF3366]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3366]/10"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF3366] to-[#6C63FF] flex items-center justify-center text-white font-bold text-xl">
                    {persona.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {persona.name}
                    </h3>
                    <p className="text-gray-400">{persona.category}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">{persona.description}</p>
                <button
                  onClick={() => router.push(`/chat?persona=${persona._id}`)}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Chat Now
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <button
            onClick={handleCreatePersona}
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-medium hover:opacity-90 transition-opacity"
          >
            <span className="mr-2">Create Custom Persona</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
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
