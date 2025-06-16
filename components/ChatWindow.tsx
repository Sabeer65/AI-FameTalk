"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { FiSend, FiMessageSquare } from "react-icons/fi";
import TypingLoader from "./TypingLoader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TransitionLink from "./TransitionLink";

// --- Data Structures ---
interface Persona {
  _id: string;
  name: string;
  imageUrl: string;
  category: string;
  systemPrompt: string;
}

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatWindowProps {
  persona: Persona | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const GUEST_MESSAGE_LIMIT = 5;

export default function ChatWindow({
  persona,
  messages,
  setMessages,
}: ChatWindowProps) {
  const { data: session, status } = useSession();
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !persona || isLoading) return;

    // --- Guest Rate Limiting Logic ---
    if (status === "unauthenticated") {
      const guestCount = parseInt(
        localStorage.getItem("guestMessageCount") || "0",
        10,
      );
      if (guestCount >= GUEST_MESSAGE_LIMIT) {
        setShowLimitModal(true);
        return;
      }
      localStorage.setItem("guestMessageCount", (guestCount + 1).toString());
    }

    const newUserMessage: Message = {
      role: "user",
      parts: [{ text: userInput }],
    };
    const currentHistory = messages[0]?.parts[0].text.startsWith("Hello!")
      ? messages.slice(1)
      : messages;
    const currentMessagesForUI = [...messages, newUserMessage];

    setMessages(currentMessagesForUI);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userInput,
          chatHistory: currentHistory,
          systemPrompt: persona.systemPrompt,
          personaId: persona._id,
        }),
      });

      // NEW: Handle the "Too Many Requests" error for signed-in free users
      if (response.status === 429) {
        const data = await response.json();
        throw new Error(
          data.error || "You have reached your monthly message limit.",
        );
      }

      if (!response.ok) {
        throw new Error("API request failed. Please try again later.");
      }

      const data = await response.json();
      const botMessage: Message = {
        role: "model",
        parts: [{ text: data.botMessage }],
      };
      setMessages([...currentMessagesForUI, botMessage]);
    } catch (error: any) {
      console.error("Failed to get response:", error);
      // NEW: This now displays any error message (including our custom one) in the chat
      const errorMessage: Message = {
        role: "model",
        parts: [{ text: error.message }],
      };
      setMessages([...currentMessagesForUI, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!persona) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <FiMessageSquare className="text-muted-foreground mb-4" size={64} />
        <h2 className="text-2xl font-bold">Select a chat to begin</h2>
        <p className="text-muted-foreground">
          Choose a persona from the sidebar to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <>
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Free Message Limit Reached</DialogTitle>
            <DialogDescription>
              You've used all your free messages for this session. Please sign
              up for a free account to continue the conversation and save your
              chat history.
            </DialogDescription>
          </DialogHeader>
          <TransitionLink href="/sign-in" className="w-full">
            <Button className="w-full">Sign Up to Continue</Button>
          </TransitionLink>
        </DialogContent>
      </Dialog>

      <div className="bg-background text-foreground flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center border-b p-4">
          <img
            src={persona.imageUrl}
            alt={persona.name}
            className="mr-4 h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-bold">{persona.name}</h2>
            <p className="text-muted-foreground text-sm">{persona.category}</p>
          </div>
        </header>

        <main className="flex-1 space-y-6 overflow-y-auto p-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-lg rounded-lg p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <TypingLoader />
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="bg-background border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`Message ${persona.name}...`}
              className="flex-1"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !userInput.trim()}
            >
              <FiSend className="h-4 w-4" />
            </Button>
          </form>
        </footer>
      </div>
    </>
  );
}
