// This is the full code for the file: components/ChatWindow.tsx
// It replaces the entire existing content of this file.

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  FiSend,
  FiMessageSquare,
  FiVolume2,
  FiMic,
  FiRadio,
  FiX, // Import the 'X' icon for stopping
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
import { useVoice } from "@/components/VoiceProvider";
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
  // State to track the index of the message currently being spoken
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<
    number | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isReady: isTtsAvailable, isSpeaking, speak, cancel } = useVoice();

  const handleFinalTranscript = (transcript: string) => {
    setUserInput((prev) => (prev + " " + transcript).trim());
  };

  const { isListening, interimTranscript, startListening, stopListening } =
    useSpeechToText({ onFinalTranscript: handleFinalTranscript });

  useEffect(() => {
    setMessages(initialMessages);
    setUserInput("");
    // When the chat changes, stop any currently playing speech.
    cancel();
    setSpeakingMessageIndex(null);
  }, [initialMessages, cancel]);

  useEffect(() => {
    if (isListening) {
      setUserInput(interimTranscript);
    }
  }, [interimTranscript, isListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleFormSubmit = async () => {
    if (!userInput.trim() || !persona || isSending) return;
    if (isListening) stopListening();
    // Stop any speech before sending a new message
    cancel();
    setSpeakingMessageIndex(null);

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
          chatHistory: isNewChat ? [] : messages.slice(0, -1),
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

      // Automatically speak the new response.
      speak(botMessage.parts[0].text, persona.gender, {
        onstart: () => setSpeakingMessageIndex(messages.length), // The index will be the last item
        onend: () => setSpeakingMessageIndex(null),
      });

      if (isNewChat && status === "authenticated") {
        onNewChatStarted();
      }
    } catch (error: any) {
      const errorMessage: IMessage = {
        role: "model",
        parts: [{ text: `Error: ${error.message}` }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      // Stop any TTS before starting speech recognition
      cancel();
      setSpeakingMessageIndex(null);
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handleSpeakClick = (text: string, index: number) => {
    if (!persona) return;
    if (!isTtsAvailable) {
      toast.error("Voice Service Not Available");
      return;
    }

    // If the clicked message is already the one speaking, cancel it.
    if (isSpeaking && speakingMessageIndex === index) {
      cancel();
      setSpeakingMessageIndex(null);
    } else {
      // Otherwise, speak the new message. The provider will handle interruption.
      speak(text, persona.gender, {
        onstart: () => setSpeakingMessageIndex(index),
        onend: () => setSpeakingMessageIndex(null),
      });
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
            className={`group relative flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "model" && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={persona.imageUrl} />
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
                onClick={() => handleSpeakClick(msg.parts[0].text, index)}
              >
                {isSpeaking && speakingMessageIndex === index ? (
                  <FiX className="h-4 w-4" />
                ) : (
                  <FiVolume2 className="h-4 w-4" />
                )}
              </Button>
            )}
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
            value={userInput}
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
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guest Limit Reached</DialogTitle>
            <DialogDescription>
              You have reached the message limit for guests. Please sign in to
              continue chatting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowLimitModal(false)}>
              Cancel
            </Button>
            <TransitionLink href="/login">
              <Button>Sign In</Button>
            </TransitionLink>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
