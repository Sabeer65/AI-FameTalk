"use client";

import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface Persona {
  _id: string;
  name: string;
  imageUrl: string;
}

interface SidebarItem {
  sessionId: string | null;
  persona: Persona;
}

interface ChatSidebarProps {
  items: SidebarItem[];
  activePersonaId: string | null;
  onSelectChat: (personaId: string) => void;
  onHideChat: (sessionId: string) => void;
  isSidebarOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ChatSidebar({
  items,
  activePersonaId,
  onSelectChat,
  onHideChat,
  isSidebarOpen,
  searchQuery,
  setSearchQuery,
}: ChatSidebarProps) {
  return (
    <aside
      className={cn(
        "bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
        "absolute inset-y-0 left-0 z-20 w-80 transform border-r md:relative md:translate-x-0",
        {
          "translate-x-0": isSidebarOpen,
          "-translate-x-full": !isSidebarOpen,
        },
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="relative my-4">
          <FiSearch className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
          <Input
            placeholder="Search chats..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {items.map(({ sessionId, persona }) => (
            <button
              key={persona._id}
              onClick={() => onSelectChat(persona._id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-medium transition-colors",
                activePersonaId === persona._id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent",
              )}
            >
              <Avatar className="border-primary/50 h-9 w-9 border-2">
                <AvatarImage src={persona.imageUrl} alt={persona.name} />
                <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{persona.name}</span>
              {sessionId && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onHideChat(sessionId);
                  }}
                  className={cn(
                    "text-muted-foreground ml-auto rounded p-1 opacity-0 transition-opacity group-hover:opacity-100",
                    activePersonaId === persona._id
                      ? "text-primary-foreground/70 hover:bg-primary-foreground/20"
                      : "hover:bg-destructive/20 hover:text-destructive",
                  )}
                >
                  <FiTrash2 className="h-4 w-4" />
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
