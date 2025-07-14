import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

export async function POST(request: Request) {
  console.log("Razorpay webhook received...");

  try {
    const text = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Webhook Error: No signature found.");
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 },
      );
    }

    // 1. VERIFY THE WEBHOOK SIGNATURE (CRITICAL SECURITY STEP)
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(text);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
      console.error("Webhook Error: Invalid signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(text);

    // 2. PROCESS THE "SUBSCRIPTION CHARGED" EVENT
    if (event.event === "subscription.charged") {
      console.log("Processing 'subscription.charged' event...");

      const subscription = event.payload.subscription.entity;
      const userId = subscription.notes?.userId;

      if (!userId) {
        console.error("Webhook Error: No userId found in subscription notes.");
        return NextResponse.json(
          { error: "User ID not found in subscription" },
          { status: 400 },
        );
      }

      await dbConnect();

      // 3. UPDATE THE USER IN THE DATABASE
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { subscriptionTier: "premium" } },
        { new: true },
      );

      if (updatedUser) {
        console.log(`Successfully upgraded user ${userId} to premium.`);
      } else {
        console.error(
          `Webhook Error: Failed to find and update user with ID ${userId}.`,
        );
      }
    } else {
      console.log(`Received unhandled event: ${event.event}`);
    }

    // 4. Acknowledge receipt of the webhook
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
