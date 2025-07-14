import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Persona from "@/models/Persona";
import ChatSession from "@/models/ChatSession";
import { NextRequest } from "next/server";
import { IUser } from "@/types";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { personaId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
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

    const persona = await Persona.findById(personaId);
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // THE FIX: We convert the ObjectId to a string before comparing.
    const isCreator = persona.creatorId.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "Forbidden: You do not have permission to delete this persona.",
        },
        { status: 403 },
      );
    }

    const creator: IUser | null = await User.findById(persona.creatorId);

    // Decrement the count if the creator is found and is on the free tier
    if (creator && creator.subscriptionTier === "free") {
      await User.updateOne(
        { _id: persona.creatorId },
        { $inc: { personasCreated: -1 } },
      );
    }

    // Perform deletions
    await Persona.findByIdAndDelete(personaId);
    await ChatSession.deleteMany({ personaId: personaId });

    return NextResponse.json(
      { message: "Persona deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Persona API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
