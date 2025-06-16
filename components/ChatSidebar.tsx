"use client";

import React from "react";

interface Persona {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
}

interface ChatSidebarProps {
  personas: Persona[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  isSidebarOpen: boolean;
}

export default function ChatSidebar({
  personas,
  activeChatId,
  onSelectChat,
  isSidebarOpen,
}: ChatSidebarProps) {
  return (
    <aside
      className={`fixed md:relative top-0 left-0 h-full bg-[#1A1A2E]/80 backdrop-blur-lg border-r border-[#FF3366]/20 w-80 md:w-1/3 lg:w-1/4 transition-transform duration-300 ease-in-out z-20 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 overflow-y-auto`}
    >
      <div className="p-6 border-b border-[#FF3366]/20">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF3366] to-[#6C63FF]">
          Conversations
        </h2>
      </div>
      <div className="overflow-y-auto h-[calc(100%-73px)]">
        {personas.map((persona) => (
          <div
            key={persona._id}
            onClick={() => onSelectChat(persona._id)}
            className={`flex items-center p-4 cursor-pointer transition-all duration-300 ${
              activeChatId === persona._id
                ? "bg-gradient-to-r from-[#FF3366]/20 to-[#6C63FF]/20 border-l-4 border-[#FF3366]"
                : "hover:bg-[#FF3366]/5"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-extrabold text-2xl mr-4 flex items-center justify-center overflow-hidden">
              {persona.imageUrl ? (
                <img src={persona.imageUrl} alt={persona.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className="w-12 h-12 flex items-center justify-center">{persona.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-grow overflow-hidden">
              <h3 className="font-semibold text-white truncate">
                {persona.name}
              </h3>
              <p className="text-sm text-gray-400 truncate">
                {persona.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
