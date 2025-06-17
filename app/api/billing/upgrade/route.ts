import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await dbConnect();

    await User.findByIdAndUpdate(userId, {
      $set: { subscriptionTier: "premium" },
    });

    console.log(`User ${userId} manually upgraded to premium.`);
    return NextResponse.json(
      { message: "User upgraded to premium successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manual Upgrade API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
