import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import Persona from "@/models/Persona"; // This import is necessary for populate

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    // If user is not logged in, return an empty array instead of an error
    return NextResponse.json([], { status: 200 });
  }

  try {
    await dbConnect();

    // Find all ACTIVE chat sessions for the logged-in user
    // and populate them with the details of the persona they are linked to.
    const sessions = await ChatSession.find({
      userId: session.user.id,
      isActive: true,
    })
      .populate({
        // This ensures we get the full persona object
        path: "personaId",
        model: Persona,
      })
      .sort({ updatedAt: -1 });

    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("API GET Active Chats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch active chats" },
      { status: 500 },
    );
  }
}
