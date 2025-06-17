import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import { NextRequest } from "next/server";

// This function handles PUT requests to /api/chathistory/[sessionId]
// We use PUT because we are updating an existing resource.
export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { sessionId } = params;
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    // 2. Find the chat session by its ID
    const chatSession = await ChatSession.findById(sessionId);
    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 },
      );
    }

    // 3. Authorize the action: user must own this chat session
    if (chatSession.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this chat session." },
        { status: 403 },
      );
    }

    // 4. Update the session to be inactive
    chatSession.isActive = false;
    await chatSession.save();

    return NextResponse.json(
      { message: "Chat session hidden successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Hide Chat API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
