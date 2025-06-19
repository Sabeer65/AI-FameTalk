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
}

const GUEST_MESSAGE_LIMIT = 5;

export default function ChatWindow({
  persona,
  initialMessages,
}: ChatWindowProps) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<IMessage[]>(initialMessages);
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

    const newUserMessage: IMessage = {
      role: "user",
      parts: [{ text: userInput }],
    };

    // --- THIS IS THE FIX ---
    // Create an up-to-date message list for the API call.
    // If it's the first message (history only contains the greeting), send an empty history.
    // Otherwise, send the real message history.
    const historyForAPI =
      messages.length === 1 && messages[0].role === "model" ? [] : messages;

    // Optimistically update the UI with the user's new message
    setMessages((prev) => [...prev, newUserMessage]);

    const textToSubmit = userInput;
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: textToSubmit,
          chatHistory: historyForAPI, // Use the correctly prepared history
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

      // Update the UI with the final bot message
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: IMessage = {
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
    <div className="bg-background/30 text-foreground flex flex-1 flex-col overflow-hidden">
      {/* ... The rest of the JSX is unchanged ... */}
    </div>
  );
}
