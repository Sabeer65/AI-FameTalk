"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiSend, FiMic, FiSquare, FiMessageSquare } from "react-icons/fi";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { toast } from "sonner";
import { VoiceContext } from "./VoiceProvider";
import TypingLoader from "./TypingLoader";
import TransitionLink from "./TransitionLink";
import { cn } from "@/lib/utils";

interface Persona {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  gender: "male" | "female" | "neutral";
}
interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}
interface ChatWindowProps {
  persona: Persona | null;
  initialMessages: Message[];
  sessionId: string | null;
  onNewMessage: () => void;
}

export default function ChatWindow({
  persona,
  initialMessages,
  sessionId,
  onNewMessage,
}: ChatWindowProps) {
  const [optimisticMessages, setOptimisticMessages] =
    useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const voiceContext = useContext(VoiceContext);
  const { isListening, interimTranscript, startListening, stopListening } =
    useSpeechToText((finalTranscript) => {
      setInput((prev) => prev + finalTranscript);
    });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOptimisticMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (isListening) {
      setInput(interimTranscript);
    }
  }, [interimTranscript, isListening]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [optimisticMessages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || !persona) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setOptimisticMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          personaId: persona._id,
          sessionId: sessionId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "API error");
      }
      const data = await res.json();
      const modelMessage: Message = {
        role: "model",
        parts: [{ text: data.text }],
      };

      setOptimisticMessages((prev) => [...prev, modelMessage]);
      onNewMessage();
      voiceContext?.speak({ text: data.text, gender: persona.gender });
    } catch (error: any) {
      toast.error("Message failed", { description: error.message });
      setOptimisticMessages(initialMessages);
    } finally {
      setIsSending(false);
    }
  };

  const handleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      setInput("");
      startListening();
    }
  };

  if (!persona) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <FiMessageSquare className="text-muted-foreground h-16 w-16" />
        <h2 className="text-2xl font-bold">Select a Chat</h2>
        <p className="text-muted-foreground max-w-md">
          Choose an existing conversation or start a new one.
        </p>
        <TransitionLink href="/personas">
          <Button>Explore Personas</Button>
        </TransitionLink>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b p-4">
        <Avatar>
          <AvatarImage src={persona.imageUrl} />
          <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-bold">{persona.name}</h2>
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {persona.description}
          </p>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-6">
        {optimisticMessages.map((msg, index) => (
          <div
            key={index}
            className={cn("flex items-start gap-4", {
              "justify-end": msg.role === "user",
            })}
          >
            {msg.role === "model" && (
              <Avatar className="h-9 w-9">
                <AvatarImage src={persona.imageUrl} />
                <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn("max-w-lg rounded-xl px-4 py-3 text-sm shadow-md", {
                "bg-primary text-primary-foreground rounded-br-none":
                  msg.role === "user",
                "bg-secondary text-secondary-foreground rounded-bl-none":
                  msg.role === "model",
              })}
            >
              {msg.parts.map((part, i) => (
                <p key={i}>{part.text}</p>
              ))}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex items-start gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={persona.imageUrl} />
              <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="bg-secondary rounded-xl rounded-bl-none px-4 py-3 shadow-md">
              <TypingLoader />
            </div>
          </div>
        )}
      </div>
      <footer className="border-t p-4">
        <div className="relative">
          <Textarea
            placeholder="Type your message or use the mic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            className="min-h-[48px] resize-none pr-32"
          />
          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRecord}
              className={cn({
                "bg-destructive text-destructive-foreground": isListening,
              })}
            >
              {isListening ? <FiSquare /> : <FiMic />}
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isSending}
            >
              <FiSend />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
