// This is the full code for the file: app/api/billing/create-subscription/route.ts
// It replaces the entire existing content of this file.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// --- Step 1: Check for API Keys on server startup ---
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error(
    "FATAL ERROR: Razorpay API Key ID or Secret is not defined in .env.local",
  );
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  console.log("\n--- 'Create Subscription' API endpoint hit ---");

  try {
    // --- Step 2: Authentication ---
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error("API Error: Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`Authenticated as user: ${session.user.email}`);

    // --- Step 3: Validate Incoming Data ---
    const { planId } = await req.json();
    if (!planId) {
      console.error("API Error: 'planId' was not received from the client.");
      return NextResponse.json(
        { error: "Plan ID is required from the client." },
        { status: 400 },
      );
    }
    console.log(`Received planId: ${planId}`);

    // --- Step 4: Database Connection ---
    await dbConnect();
    console.log("Database connected successfully.");

    let user = await User.findById(session.user.id);
    if (!user) {
      console.error(
        `API Error: User not found in DB for ID: ${session.user.id}`,
      );
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    console.log(
      `Found user in database. Current tier: ${user.subscriptionTier}`,
    );

    // --- Step 5: Check for Existing Subscription ---
    if (user.razorpaySubscriptionId) {
      console.warn(
        `User ${user._id} already has a subscription. Halting process.`,
      );
      return NextResponse.json(
        { error: "You already have an active subscription." },
        { status: 409 }, // 409 Conflict
      );
    }

    // --- Step 6: Instantly Upgrade User in DB ---
    user.subscriptionTier = "pro";
    console.log(`Attempting to upgrade user to 'pro' in DB...`);
    await user.save();
    console.log(`Successfully upgraded user to 'pro' in DB.`);

    // --- Step 7: Create Razorpay Subscription ---
    console.log("Attempting to create Razorpay subscription...");
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      notes: { userId: user._id.toString() },
    });
    console.log(
      `Razorpay subscription created successfully: ${subscription.id}`,
    );

    // --- Step 8: Save Subscription ID and Respond ---
    user.razorpaySubscriptionId = subscription.id;
    await user.save();
    console.log("Saved Razorpay subscription ID to user document.");

    return NextResponse.json({ url: subscription.short_url });
  } catch (error: any) {
    // --- THE MOST IMPORTANT PART: Detailed Error Logging ---
    console.error("\n---!!! AN ERROR OCCURRED IN THE API ROUTE !!!---");
    // This checks if the error came from Razorpay and has a detailed description
    if (error.error && error.error.description) {
      console.error("Razorpay Error Description:", error.error.description);
      return NextResponse.json(
        { error: `Payment Gateway Error: ${error.error.description}` },
        { status: 500 },
      );
    }
    // For any other type of error
    console.error("Generic Error:", error.message);
    return NextResponse.json(
      { error: "An unexpected internal error occurred." },
      { status: 500 },
    );
  }
}
