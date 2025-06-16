"use client";

import React, { useState, useEffect, useMemo } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { FiMenu, FiX } from "react-icons/fi";

interface Persona {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  systemPrompt: string; // Add systemPrompt to the interface
}

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatLayoutProps {
  initialPersonaId: string | null;
}

export default function ChatLayout({ initialPersonaId }: ChatLayoutProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialPersonaId
  );
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setActiveChatId(initialPersonaId);
  }, [initialPersonaId]);

  // This effect now fetches BOTH the persona list AND the chat history for the active persona
  useEffect(() => {
    const fetchPersonasAndHistory = async () => {
      setIsLoading(true);
      try {
        // Fetch the list of all personas for the sidebar
        const personasResponse = await fetch("/api/personas");
        if (!personasResponse.ok) throw new Error("Failed to fetch personas");
        const personasData = await personasResponse.json();
        setPersonas(personasData);

        // If a chat is selected, fetch its history
        if (activeChatId) {
          const historyResponse = await fetch(
            `/api/chathistory/${activeChatId}`
          );

          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setMessages(historyData.messages);
          } else if (historyResponse.status === 404) {
            // No history found, set the initial greeting message
            const activePersona = personasData.find(
              (p: Persona) => p._id === activeChatId
            );
            if (activePersona) {
              setMessages([
                {
                  role: "model",
                  parts: [
                    {
                      text: `Hello! I am ${activePersona.name}. What would you like to talk about today?`,
                    },
                  ],
                },
              ]);
            }
          } else {
            throw new Error("Failed to fetch chat history");
          }
        } else {
          setMessages([]); // If no chat is active, clear messages
        }
      } catch (error) {
        console.error(error);
        // Handle error state if necessary
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonasAndHistory();
  }, [activeChatId]); // This hook now re-runs whenever the active chat changes

  const activePersona = useMemo(() => {
    return personas.find((p) => p._id === activeChatId) || null;
  }, [activeChatId, personas]);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-69px)] text-foreground overflow-hidden">
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-30 bg-card p-2 rounded-full"
      >
        {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <ChatSidebar
        personas={personas}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex flex-col">
        {/* We now pass messages and a setter function to ChatWindow */}
        <ChatWindow
          persona={activePersona}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
}
