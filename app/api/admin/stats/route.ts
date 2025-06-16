import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Persona from "@/models/Persona";
import ChatSession from "@/models/ChatSession";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const userCount = await User.countDocuments();
    const personaCount = await Persona.countDocuments();
    const chatCount = await ChatSession.countDocuments();

    // Aggregate top 5 most used personas by chat count
    const topBotsAgg = await ChatSession.aggregate([
      { $group: { _id: "$personaId", chatCount: { $sum: 1 } } },
      { $sort: { chatCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "personas",
          localField: "_id",
          foreignField: "_id",
          as: "personaInfo"
        }
      },
      { $unwind: "$personaInfo" },
      {
        $project: {
          _id: 1,
          chatCount: 1,
          name: "$personaInfo.name",
          imageUrl: "$personaInfo.imageUrl"
        }
      }
    ]);

    const stats = {
      userCount,
      personaCount,
      chatCount,
      topBots: topBotsAgg,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
