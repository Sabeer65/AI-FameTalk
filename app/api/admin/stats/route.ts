import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Persona from "@/models/Persona";
import ChatSession from "@/models/ChatSession";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await dbConnect();
  const [userCount, personaCount, chatCount] = await Promise.all([
    User.countDocuments(),
    Persona.countDocuments(),
    ChatSession.countDocuments(),
  ]);
  return NextResponse.json({ userCount, personaCount, chatCount });
}
