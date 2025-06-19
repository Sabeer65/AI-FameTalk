"use client";

import React, { useState, useEffect, useMemo } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { FiMenu, FiX } from "react-icons/fi";
import { toast } from "sonner";
import TypingLoader from "./TypingLoader";

interface Persona {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  systemPrompt: string;
  gender: "male" | "female" | "neutral";
}
interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}
interface PopulatedChatSession {
  _id: string;
  personaId: Persona;
  messages: Message[];
}
interface ChatLayoutProps {
  initialPersonaId: string | null;
}

export default function ChatLayout({ initialPersonaId }: ChatLayoutProps) {
  const [sessions, setSessions] = useState<PopulatedChatSession[]>([]);
  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(
    initialPersonaId,
  );
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [sessionsRes, personasRes] = await Promise.all([
          fetch("/api/chathistory"),
          fetch("/api/personas"),
        ]);
        if (!sessionsRes.ok || !personasRes.ok) {
          throw new Error("Failed to fetch initial data");
        }
        const sessionsData = await sessionsRes.json();
        const personasData = await personasRes.json();

        setSessions(sessionsData);
        setAllPersonas(personasData);

        if (initialPersonaId) {
          setActivePersonaId(initialPersonaId);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [initialPersonaId]);

  const sidebarItems = useMemo(() => {
    const sessionPersonaIds = new Set(sessions.map((s) => s.personaId._id));
    const existingSessionItems = sessions.map((s) => ({
      sessionId: s._id,
      persona: s.personaId,
    }));
    const newPersonaItems = allPersonas
      .filter((p) => !sessionPersonaIds.has(p._id))
      .map((p) => ({ sessionId: null, persona: p }));

    return [...existingSessionItems, ...newPersonaItems].filter((item) =>
      item.persona.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [sessions, allPersonas, searchQuery]);

  const activeChatData = useMemo(() => {
    if (!activePersonaId) return null;
    const activeItem = sidebarItems.find(
      (item) => item.persona._id === activePersonaId,
    );
    if (!activeItem) return null;

    if (activeItem.sessionId) {
      const session = sessions.find((s) => s._id === activeItem.sessionId);
      return {
        persona: activeItem.persona,
        messages: session?.messages || [],
        sessionId: activeItem.sessionId,
      };
    } else {
      const greetingMessage: Message = {
        role: "model",
        parts: [
          {
            text: `Hello! I am ${activeItem.persona.name}. What would you like to talk about today?`,
          },
        ],
      };
      return {
        persona: activeItem.persona,
        messages: [greetingMessage],
        sessionId: null,
      };
    }
  }, [activePersonaId, sidebarItems, sessions]);

  const handleSelectChat = (personaId: string) => {
    setActivePersonaId(personaId);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleHideChat = async (sessionId: string) => {
    const previousSessions = sessions;
    setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    if (
      sessions.find((s) => s._id === sessionId)?.personaId._id ===
      activePersonaId
    ) {
      setActivePersonaId(null);
    }
    try {
      const response = await fetch(`/api/chathistory/${sessionId}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to hide chat.");
      toast.success("Conversation Hidden");
    } catch (error) {
      toast.error("Could not hide conversation.");
      setSessions(previousSessions);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-69px)] flex-1 items-center justify-center">
        <TypingLoader />
      </div>
    );
  }

  return (
    <div className="text-foreground relative flex h-[calc(100vh-69px)] overflow-hidden font-sans">
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="bg-card absolute top-4 left-4 z-30 rounded-full p-2 md:hidden"
      >
        {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>
      <ChatSidebar
        items={sidebarItems}
        activePersonaId={activePersonaId}
        onSelectChat={handleSelectChat}
        onHideChat={handleHideChat}
        isSidebarOpen={isSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex flex-1 flex-col">
        <ChatWindow
          persona={activeChatData?.persona || null}
          initialMessages={activeChatData?.messages || []}
          key={activeChatData?.persona?._id || "no-chat"}
        />
      </div>
    </div>
  );
}
