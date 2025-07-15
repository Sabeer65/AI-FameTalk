// This is the full code for the file: app/api/personas/[personaId]/route.ts
// It replaces the entire existing content of this file.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Persona from "@/models/Persona";
import ChatSession from "@/models/ChatSession"; // Import ChatSession model

// --- GET a single persona by its ID ---
export async function GET(
  req: NextRequest,
  { params }: { params: { personaId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const persona = await Persona.findById(params.personaId);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    if (
      persona.creatorId.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(persona);
  } catch (error) {
    console.error("Failed to fetch persona:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// --- UPDATE an existing persona ---
export async function PUT(
  req: NextRequest,
  { params }: { params: { personaId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await dbConnect();

    const personaToUpdate = await Persona.findById(params.personaId);

    if (!personaToUpdate) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    if (personaToUpdate.creatorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPersona = await Persona.findByIdAndUpdate(
      params.personaId,
      body,
      { new: true, runValidators: true },
    );

    return NextResponse.json(updatedPersona);
  } catch (error) {
    console.error("Failed to update persona:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// --- THE FIX: Add the DELETE handler to this non-admin route ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: { personaId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { personaId } = params;

  try {
    await dbConnect();
    const persona = await Persona.findById(personaId);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Security check: Only the creator or an admin can delete
    if (
      persona.creatorId.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete associated chat sessions first
    await ChatSession.deleteMany({ personaId: personaId });

    // Then delete the persona
    await Persona.findByIdAndDelete(personaId);

    return NextResponse.json({ message: "Persona deleted successfully" });
  } catch (error) {
    console.error("Failed to delete persona:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
