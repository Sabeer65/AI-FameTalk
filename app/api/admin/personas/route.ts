import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; //
import dbConnect from "@/lib/dbConnect"; //
import Persona from "@/models/Persona"; //

// GET all personas
export async function GET() {
  const session = await getServerSession(authOptions); //
  if (!session || session.user?.role !== "admin") { //
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); //
  }

  try {
    await dbConnect(); //
    const personas = await Persona.find({}).lean(); //
    return NextResponse.json(personas, { status: 200 }); //
  } catch (error) {
    console.error("Admin GET Personas Error:", error); //
    return NextResponse.json({ error: "Failed to fetch personas" }, { status: 500 }); //
  }
}

// PATCH/PUT update persona
export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions); //
    if (!session || session.user?.role !== "admin") { //
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); //
    }

    const { personaId, updates } = await request.json(); // updates might contain { name: 'New Name', description: 'Updated desc' }

    if (!personaId || !updates) { //
        return NextResponse.json({ error: "Missing personaId or updates" }, { status: 400 }); //
    }

    try {
        await dbConnect(); //
        const persona = await Persona.findById(personaId); //

        if (!persona) { //
            return NextResponse.json({ error: "Persona not found" }, { status: 404 }); //
        }

        Object.assign(persona, updates); // Apply updates
        await persona.save(); //

        return NextResponse.json({ message: "Persona updated successfully", persona }, { status: 200 }); //
    } catch (error) {
        console.error("Admin PATCH Persona Error:", error); //
        return NextResponse.json({ error: "Failed to update persona" }, { status: 500 }); //
    }
}

// DELETE a persona
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions); //
    if (!session || session.user?.role !== "admin") { //
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); //
    }

    const { personaId } = await request.json(); //

    if (!personaId) { //
        return NextResponse.json({ error: "Missing personaId" }, { status: 400 }); //
    }

    try {
        await dbConnect(); //
        const result = await Persona.findByIdAndDelete(personaId); //

        if (!result) { //
            return NextResponse.json({ error: "Persona not found" }, { status: 404 }); //
        }

        // Optionally, also delete related chat sessions for this persona
        // import ChatSession from "@/models/ChatSession";
        // await ChatSession.deleteMany({ personaId: personaId }); //

        return NextResponse.json({ message: "Persona deleted successfully" }, { status: 200 }); //
    } catch (error) {
        console.error("Admin DELETE Persona Error:", error); //
        return NextResponse.json({ error: "Failed to delete persona" }, { status: 500 }); //
    }
}