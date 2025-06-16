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
      className={`absolute md:static top-0 left-0 h-full bg-gray-900 border-r border-gray-700 w-80 md:w-1/3 lg:w-1/4 transition-transform duration-300 ease-in-out z-20 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Conversations</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100%-65px)]">
        {personas.map((persona) => (
          <div
            key={persona._id}
            onClick={() => onSelectChat(persona._id)}
            className={`flex items-center p-4 cursor-pointer transition-colors ${
              activeChatId === persona._id ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            <img
              src={persona.imageUrl}
              alt={persona.name}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
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
