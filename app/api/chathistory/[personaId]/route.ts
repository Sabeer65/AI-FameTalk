import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import { NextRequest } from "next/server";

// Add the 'async' keyword here
export async function GET(
  request: NextRequest,
  { params }: { params: { personaId: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { personaId } = params;

  if (!personaId) {
    return NextResponse.json(
      { error: "Persona ID is required" },
      { status: 400 },
    );
  }

  try {
    await dbConnect();

    const chatSession = await ChatSession.findOne({
      userId: userId,
      personaId: personaId,
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "No chat history found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { messages: chatSession.messages },
      { status: 200 },
    );
  } catch (error) {
    console.error("API Error fetching chat history:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
