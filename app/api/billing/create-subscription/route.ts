import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import Razorpay from "razorpay";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

// Initialize Razorpay with your keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const planId = process.env.RAZORPAY_PLAN_ID;

  if (!planId) {
    return NextResponse.json(
      { error: "Subscription plan not configured." },
      { status: 500 },
    );
  }

  try {
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.subscriptionTier === "premium") {
      return NextResponse.json(
        { error: "User is already on a premium plan." },
        { status: 400 },
      );
    }

    const subscriptionOptions = {
      plan_id: planId,
      customer_notify: true as const,
      total_count: 12 as const,
      notes: {
        userId: userId,
      },
    };

    // The problematic import is removed. TypeScript can now infer the type correctly.
    const subscription =
      await razorpay.subscriptions.create(subscriptionOptions);

    if (!subscription) {
      throw new Error("Failed to create Razorpay subscription.");
    }

    return NextResponse.json(
      {
        subscriptionId: subscription.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Create Subscription API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
