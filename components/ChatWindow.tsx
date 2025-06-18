"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  FiSend,
  FiMessageSquare,
  FiVolume2,
  FiMic,
  FiRadio,
} from "react-icons/fi";
import TypingLoader from "./TypingLoader";
import { Button } from "./ui/button";
import TextareaAutosize from "react-textarea-autosize";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TransitionLink from "./TransitionLink";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface Persona {
  _id: string;
  name: string;
  imageUrl: string;
  category: string;
  systemPrompt: string;
  gender: "male" | "female" | "neutral";
}
interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}
interface ChatWindowProps {
  persona: Persona | null;
  initialMessages: Message[];
}

const GUEST_MESSAGE_LIMIT = 5;

export default function ChatWindow({
  persona,
  initialMessages,
}: ChatWindowProps) {
  const { status } = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { speak } = useTextToSpeech();
  const handleFinalTranscript = (transcript: string) => {
    setUserInput((prev) => (prev + " " + transcript).trim());
  };
  const { isListening, interimTranscript, startListening, stopListening } =
    useSpeechToText(handleFinalTranscript);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (isListening) setUserInput(interimTranscript);
  }, [interimTranscript, isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isLoading]);

  const handleFormSubmit = async () => {
    if (!userInput.trim() || !persona || isLoading) return;
    if (isListening) stopListening();

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
    setMessages((prev) => [...prev, newUserMessage]);

    const textToSubmit = userInput;
    setUserInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages[0]?.parts[0].text.startsWith("Hello!")
        ? messages.slice(1)
        : messages;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: textToSubmit,
          chatHistory: chatHistory,
          systemPrompt: persona.systemPrompt,
          personaId: persona._id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "API request failed.");
      }

      const data = await response.json();
      const botMessage: Message = {
        role: "model",
        parts: [{ text: data.botMessage }],
      };
      setMessages((prev) => [...prev, botMessage]);
      speak(botMessage.parts[0].text, persona.gender);
    } catch (error: any) {
      const errorMessage: Message = {
        role: "model",
        parts: [{ text: error.message }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) stopListening();
    else {
      setUserInput("");
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handleSpeakClick = (text: string) => {
    if (persona) speak(text, persona.gender);
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
        {/* Dialog content remains the same */}
      </Dialog>

      <div className="bg-background/30 text-foreground flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b p-4">
          <div className="flex items-center">
            <Avatar className="border-primary/50 mr-4 h-12 w-12 border-2">
              <AvatarImage src={persona.imageUrl} alt={persona.name} />
              <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{persona.name}</h2>
              <p className="text-muted-foreground text-sm">
                {persona.category}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`group relative flex items-start gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "model" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={persona.imageUrl} alt={persona.name} />
                  <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xl rounded-lg p-3 text-base ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
              {msg.role === "model" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleSpeakClick(msg.parts[0].text)}
                >
                  <FiVolume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <TypingLoader />
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="bg-background/80 border-t p-4 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit();
            }}
            className="flex items-center gap-2"
          >
            <Button
              type="button"
              variant={isListening ? "destructive" : "ghost"}
              size="icon"
              onClick={handleMicClick}
              aria-label="Use microphone"
            >
              {isListening ? (
                <FiRadio className="h-5 w-5 animate-pulse" />
              ) : (
                <FiMic className="h-5 w-5" />
              )}
            </Button>
            <TextareaAutosize
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? "Listening..." : `Message ${persona.name}...`
              }
              className="flex-1 resize-none rounded-lg p-3"
              disabled={isLoading}
              autoComplete="off"
              rows={1}
              maxRows={5}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !userInput.trim()}
              aria-label="Send message"
            >
              <FiSend className="h-5 w-5" />
            </Button>
          </form>
        </footer>
      </div>
    </>
  );
}
