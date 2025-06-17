import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import ChatSession from "@/models/ChatSession";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await dbConnect();

    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({
      subscriptionTier: "premium",
    });

    const totalMessagesAggregation = await ChatSession.aggregate([
      {
        $project: {
          messageCount: { $size: "$messages" },
        },
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: "$messageCount" },
        },
      },
    ]);

    const totalMessages =
      totalMessagesAggregation.length > 0
        ? totalMessagesAggregation[0].totalMessages
        : 0;

    const stats = {
      totalUsers,
      premiumUsers,
      totalMessages,
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
