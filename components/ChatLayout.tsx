"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import ChatSidebar, { SidebarItem } from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { FiMenu, FiX } from "react-icons/fi";
import { toast } from "sonner";
import TypingLoader from "./TypingLoader";
import { IPersona, IMessage } from "@/types";

interface ChatLayoutProps {
  initialPersonaId: string | null;
}

export default function ChatLayout({ initialPersonaId }: ChatLayoutProps) {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(
    initialPersonaId,
  );
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chathistory");
      if (!response.ok) throw new Error("Failed to fetch initial data");
      const data = await response.json();
      setSidebarItems(data);
      if (initialPersonaId && !activePersonaId) {
        setActivePersonaId(initialPersonaId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load conversation data.");
    } finally {
      setIsLoading(false);
    }
  }, [initialPersonaId, activePersonaId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredSidebarItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return sidebarItems.filter(
        (item) => item.isActive || item.persona._id === activePersonaId,
      );
    }
    return sidebarItems.filter((item) =>
      item.persona.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [sidebarItems, searchQuery, activePersonaId]);

  const activeChatData = useMemo(() => {
    if (!activePersonaId) return null;
    return (
      sidebarItems.find((item) => item.persona._id === activePersonaId) || null
    );
  }, [activePersonaId, sidebarItems]);

  const handleSelectChat = async (item: SidebarItem) => {
    if (!item.isActive && item.sessionId) {
      try {
        const response = await fetch(`/api/chathistory/${item.sessionId}`, {
          method: "PATCH",
        });
        if (!response.ok) throw new Error("Failed to restore chat.");

        setSidebarItems((prevItems) =>
          prevItems.map((i) =>
            i.sessionId === item.sessionId ? { ...i, isActive: true } : i,
          ),
        );
        toast.success("Conversation restored");
      } catch (error) {
        toast.error("Could not restore conversation.");
        return;
      }
    }
    setActivePersonaId(item.persona._id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleHideChat = async (sessionId: string) => {
    const previousItems = sidebarItems;
    setSidebarItems((prev) =>
      prev.map((item) =>
        item.sessionId === sessionId ? { ...item, isActive: false } : item,
      ),
    );

    if (activeChatData?.sessionId === sessionId) {
      setActivePersonaId(null);
    }

    try {
      const response = await fetch(`/api/chathistory/${sessionId}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to hide chat.");
      toast.success("Conversation Hidden");
    } catch (error) {
      toast.error("Could not hide conversation.");
      setSidebarItems(previousItems); // Revert on failure
    }
  };

  const handleNewMessage = async () => {
    // After a new chat session is created, we need to refresh the sidebar
    // to get the new sessionId and make the "hide" button appear.
    await fetchAllData();
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-69px)] flex-1 items-center justify-center">
        <TypingLoader />
      </div>
    );
  }

  return (
    <div className="text-foreground relative flex h-[calc(100vh-69px)] overflow-hidden">
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="bg-card absolute top-4 left-4 z-30 rounded-full p-2 md:hidden"
      >
        {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>
      <ChatSidebar
        items={filteredSidebarItems}
        activePersonaId={activePersonaId}
        onSelectChat={handleSelectChat}
        onHideChat={handleHideChat}
        isSidebarOpen={isSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex flex-1 flex-col">
        <ChatWindow
          persona={activeChatData?.persona || null}
          initialMessages={activeChatData?.messages || []}
          onNewChatStarted={handleNewMessage}
          key={activeChatData?.persona?._id || "no-chat"}
        />
      </div>
    </div>
  );
}
