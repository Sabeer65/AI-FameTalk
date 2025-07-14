import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import Persona from "@/models/Persona";
import { Types } from "mongoose";
import { IPersona, IMessage } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  try {
    await dbConnect();

    const personaQuery = userId
      ? {
          $or: [{ isDefault: true }, { creatorId: new Types.ObjectId(userId) }],
        }
      : { isDefault: true };

    // Fetch personas from DB (lean for plain JS objects)
    const personasFromDb = await Persona.find(personaQuery)
      .sort({ name: "asc" })
      .lean();

    let sessionsFromDb: any[] = [];
    if (userId) {
      sessionsFromDb = await ChatSession.find({
        userId: new Types.ObjectId(userId),
        isActive: true,
      }).lean();
    }

    const sessionsMap = new Map(
      sessionsFromDb.map((s) => [s.personaId.toString(), s]),
    );

    const allowedGenders = ["male", "female", "neutral"] as const;

    const responseData = personasFromDb.map((p_raw) => {
      const session = sessionsMap.get((p_raw._id as Types.ObjectId).toString());

      const persona: IPersona = {
        _id: (p_raw._id as Types.ObjectId).toString(),
        name: p_raw.name as string,
        description: p_raw.description as string,
        systemPrompt: p_raw.systemPrompt as string,
        category: p_raw.category as string,
        imageUrl: p_raw.imageUrl as string,
        creatorId: (p_raw.creatorId as Types.ObjectId).toString(),
        isDefault: p_raw.isDefault as boolean,
        gender: allowedGenders.includes(p_raw.gender as any)
          ? (p_raw.gender as "male" | "female" | "neutral")
          : "neutral",
      };

      return {
        sessionId: session?._id.toString() || null,
        messages: (session?.messages || []) as IMessage[],
        persona: persona,
        isActive: !!session,
      };
    });

    responseData.sort((a, b) => {
      if (a.sessionId && !b.sessionId) return -1;
      if (!a.sessionId && b.sessionId) return 1;
      if (a.persona.name < b.persona.name) return -1;
      if (a.persona.name > b.persona.name) return 1;
      return 0;
    });

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("API GET chathistory Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat data" },
      { status: 500 },
    );
  }
}
