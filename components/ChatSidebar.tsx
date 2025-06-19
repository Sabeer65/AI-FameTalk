"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { FiX, FiSearch } from "react-icons/fi";
import { Input } from "./ui/input";
import { IPersona, IMessage } from "@/types";

export interface SidebarItem {
  sessionId: string | null;
  persona: IPersona;
  messages: IMessage[];
  isActive: boolean;
}

interface ChatSidebarProps {
  items: SidebarItem[];
  activePersonaId: string | null;
  onSelectChat: (item: SidebarItem) => void;
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
  const filteredItems = items.filter((item) =>
    item.persona.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside
      className={cn(
        `bg-background absolute top-0 left-0 z-20 flex h-full w-80 flex-col border-r transition-transform duration-300 ease-in-out md:static md:w-[300px] lg:w-[350px]`,
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
      )}
    >
      <div className="border-b p-4">
        <h2 className="text-2xl font-bold tracking-tight">Conversations</h2>
        <div className="relative mt-4">
          <FiSearch className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
          <Input
            placeholder="Search chats..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.persona._id}
              onClick={() => onSelectChat(item)}
              className={cn(
                "group flex cursor-pointer items-center rounded-lg p-3 transition-colors",
                activePersonaId === item.persona._id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              <Avatar className="mr-4 h-10 w-10">
                <AvatarImage
                  src={item.persona.imageUrl}
                  alt={item.persona.name}
                />
                <AvatarFallback>{item.persona.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow overflow-hidden">
                <h3 className="truncate font-semibold">{item.persona.name}</h3>
                <p className="text-muted-foreground truncate text-sm">
                  {item.persona.description}
                </p>
              </div>
              {item.sessionId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHideChat(item.sessionId!);
                  }}
                  aria-label="Hide conversation"
                >
                  <FiX className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground p-4 text-center text-sm">
            {searchQuery ? "No chats found." : "No active conversations."}
          </div>
        )}
      </div>
    </aside>
  );
}
