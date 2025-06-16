import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import { NextRequest } from "next/server";

// This function handles GET requests to /api/chathistory/[personaId]
export async function GET(
  request: NextRequest,
  { params }: { params: { personaId: string } }
) {
  const { personaId } = params;

  // For now, we use a hardcoded user ID. This will be replaced by the real user ID after authentication.
  const userId = "anonymous_user";

  if (!personaId) {
    return NextResponse.json(
      { error: "Persona ID is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Find the chat session that matches the user and the persona
    const session = await ChatSession.findOne({
      userId: userId,
      personaId: personaId,
    });

    if (!session) {
      // It's not an error if no history exists, so we return 404 Not Found
      return NextResponse.json(
        { error: "No chat history found" },
        { status: 404 }
      );
    }

    // If history is found, return the messages array
    return NextResponse.json({ messages: session.messages }, { status: 200 });
  } catch (error) {
    console.error("API Error fetching chat history:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
