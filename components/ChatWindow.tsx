"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiMessageSquare } from "react-icons/fi";
import TypingLoader from "./TypingLoader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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

export default function ChatWindow({
  persona,
  messages,
  setMessages,
}: ChatWindowProps) {
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !persona || isLoading) return;

    const newUserMessage: Message = {
      role: "user",
      parts: [{ text: userInput }],
    };
    // The history sent to the API is now based on the props
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

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const botMessage: Message = {
        role: "model",
        parts: [{ text: data.botMessage }],
      };
      setMessages([...currentMessagesForUI, botMessage]);
    } catch (error) {
      console.error("Failed to get response:", error);
      const errorMessage: Message = {
        role: "model",
        parts: [
          { text: "Sorry, I'm having trouble connecting. Please try again." },
        ],
      };
      setMessages([...currentMessagesForUI, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!persona) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <FiMessageSquare className="text-muted-foreground mb-4" size={64} />
        <h2 className="text-2xl font-bold">Select a chat to begin</h2>
        <p className="text-muted-foreground">
          Choose a persona from the sidebar to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground overflow-hidden">
      <header className="flex items-center p-4 border-b">
        <img
          src={persona.imageUrl}
          alt={persona.name}
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h2 className="text-xl font-bold">{persona.name}</h2>
          <p className="text-sm text-muted-foreground">{persona.category}</p>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-lg ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
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

      <footer className="p-4 border-t bg-background">
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
            <FiSend className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
