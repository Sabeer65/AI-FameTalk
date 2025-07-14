import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import { NextRequest } from "next/server";

// This PUT method now exclusively handles HIDING (archiving) a chat
export async function PUT(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chatSession = await ChatSession.findOne({
    _id: params.sessionId,
    userId: session.user.id,
  });
  if (!chatSession)
    return NextResponse.json(
      { error: "Chat session not found or you do not have permission." },
      { status: 404 },
    );

  chatSession.isActive = false;
  await chatSession.save();
  return NextResponse.json({ message: "Chat hidden successfully." });
}

// This new PATCH method handles UN-HIDING (un-archiving) a chat
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chatSession = await ChatSession.findOne({
    _id: params.sessionId,
    userId: session.user.id,
  });
  if (!chatSession)
    return NextResponse.json(
      { error: "Chat session not found or you do not have permission." },
      { status: 404 },
    );

  chatSession.isActive = true;
  await chatSession.save();
  return NextResponse.json({ message: "Chat restored successfully." });
}
