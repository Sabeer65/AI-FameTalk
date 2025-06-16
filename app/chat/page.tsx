import React from "react";
import ChatLayout from "@/components/ChatLayout";

interface MasterChatPageProps {
  searchParams: {
    personaId?: string;
  };
}

export default async function MasterChatPage({
  searchParams,
}: MasterChatPageProps) {
  const initialPersonaId = searchParams.personaId || null;

  return <ChatLayout initialPersonaId={initialPersonaId} />;
}
