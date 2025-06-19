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
import { IPersona, IMessage } from "@/types";

interface ChatWindowProps {
  persona: IPersona | null;
  initialMessages: IMessage[];
  onNewChatStarted: () => void;
}

const GUEST_MESSAGE_LIMIT = 5;

export default function ChatWindow({
  persona,
  initialMessages,
  onNewChatStarted,
}: ChatWindowProps) {
  const { status } = useSession();
  const [messages, setMessages] = useState<IMessage[]>(initialMessages);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { speak, isAvailable: isTtsAvailable } = useTextToSpeech();
  const handleFinalTranscript = (transcript: string) => {
    setUserInput((prev) => (prev + transcript).trim());
  };
  // THE FIX: Correctly destructuring the return value from the hook
  const { isListening, interimTranscript, startListening, stopListening } =
    useSpeechToText(handleFinalTranscript);

  useEffect(() => {
    setMessages(initialMessages);
    setUserInput(""); // Clear input when chat changes
  }, [initialMessages]);

  useEffect(() => {
    if (isListening) setUserInput(interimTranscript);
  }, [interimTranscript, isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isSending]);

  const handleFormSubmit = async () => {
    if (!userInput.trim() || !persona || isSending) return;
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

    const newUserMessage: IMessage = {
      role: "user",
      parts: [{ text: userInput }],
    };
    const isNewChat = messages.length <= 1 && messages[0]?.role === "model";

    setMessages((prev) => [...prev, newUserMessage]);
    const textToSubmit = userInput;
    setUserInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: textToSubmit,
          chatHistory: isNewChat ? [] : messages,
          systemPrompt: persona.systemPrompt,
          personaId: persona._id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "API request failed.");
      }
      const data = await response.json();
      const botMessage: IMessage = {
        role: "model",
        parts: [{ text: data.botMessage }],
      };
      setMessages((prev) => [...prev, botMessage]);
      speak(botMessage.parts[0].text, persona.gender);

      if (isNewChat && status === "authenticated") {
        onNewChatStarted();
      }
    } catch (error: any) {
      const errorMessage: IMessage = {
        role: "model",
        parts: [{ text: error.message }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
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
    if (!persona) return; // THE FIX: Final null check for persona
    if (!isTtsAvailable) {
      toast.error("Voice Service Not Available", {
        description: "Please check browser settings or API key.",
      });
      return;
    }
    speak(text, persona.gender);
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
    <div className="bg-background/30 text-foreground flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={persona.imageUrl} />
            <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{persona.name}</h2>
            <p className="text-muted-foreground text-sm">{persona.category}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`group relative flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "model" && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={persona.imageUrl} />
                <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-xl rounded-lg p-3 text-base ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"}`}
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
            {/* ... user avatar ... */}
          </div>
        ))}
        {isSending && (
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
          className="flex items-start gap-2"
        >
          <Button
            type="button"
            variant={isListening ? "destructive" : "ghost"}
            size="icon"
            onClick={handleMicClick}
          >
            {isListening ? (
              <FiRadio className="h-5 w-5 animate-pulse" />
            ) : (
              <FiMic className="h-5 w-5" />
            )}
          </Button>
          <TextareaAutosize
            value={userInput || interimTranscript}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening ? "Listening..." : `Message ${persona.name}...`
            }
            className="bg-muted focus-visible:ring-ring flex-1 resize-none rounded-lg p-3 focus-visible:ring-2"
            disabled={isSending}
            autoComplete="off"
            rows={1}
            maxRows={5}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !userInput.trim()}
          >
            <FiSend className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
