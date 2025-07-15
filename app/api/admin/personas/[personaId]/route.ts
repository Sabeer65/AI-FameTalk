// This is a new file. Create it at: app/api/admin/personas/[personaId]/route.ts
// The full code for the new file is below.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Persona from "@/models/Persona";
import ChatSession from "@/models/ChatSession";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { personaId: string } },
) {
  const session = await getServerSession(authOptions);

  // --- 1. Authorization Check ---
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { personaId } = params;
  if (!personaId) {
    return NextResponse.json(
      { error: "Persona ID is required" },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    // --- 2. Delete all chat sessions associated with this persona ---
    await ChatSession.deleteMany({ personaId: personaId });

    // --- 3. Delete the persona itself ---
    const deletedPersona = await Persona.findByIdAndDelete(personaId);

    if (!deletedPersona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Persona and all associated chats deleted successfully.",
    });
  } catch (error) {
    console.error(`Error deleting persona ${personaId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
