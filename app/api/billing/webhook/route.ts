// This is the full code for the new file: app/api/billing/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { headers } from "next/headers";

const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!razorpayWebhookSecret) {
    console.error("Razorpay webhook secret is not set.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 },
    );
  }

  const signature = headers().get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
  }

  const body = await req.text();

  // --- 1. Verify the webhook signature ---
  const expectedSignature = crypto
    .createHmac("sha256", razorpayWebhookSecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // --- 2. Process the event ---
  try {
    const event = JSON.parse(body);

    // We only care about the 'subscription.charged' event
    if (event.event === "subscription.charged") {
      const subscription = event.payload.subscription.entity;
      const razorpaySubscriptionId = subscription.id;

      await dbConnect();

      // Find the user with this subscription ID and update their plan
      const updatedUser = await User.findOneAndUpdate(
        { razorpaySubscriptionId: razorpaySubscriptionId },
        {
          $set: {
            subscriptionTier: "pro",
            razorpayPaymentId: event.payload.payment.entity.id, // Store the payment ID for reference
          },
        },
        { new: true }, // Return the updated document
      );

      if (updatedUser) {
        console.log(
          `Successfully upgraded user ${updatedUser._id} to Pro plan.`,
        );
      } else {
        console.error(
          `Webhook Error: No user found with subscription ID ${razorpaySubscriptionId}`,
        );
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 },
    );
  }
}
