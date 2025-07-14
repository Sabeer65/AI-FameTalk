// This is the full code for the file: ai-fametalk/app/api/chat/route.ts
// It replaces the entire existing content of this file.

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import User from "@/models/User";
import { Types } from "mongoose";

const FREE_TIER_MESSAGE_LIMIT = 100;

interface RequestBody {
  userMessage: string;
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[];
  systemPrompt: string;
  personaId: string;
}

export async function POST(request: NextRequest) {
  // --- 1. Authentication ---
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  try {
    await dbConnect();

    // --- 2. User Validation and Rate Limiting ---
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (
      user.subscriptionTier === "free" &&
      user.monthlyMessageCount >= FREE_TIER_MESSAGE_LIMIT
    ) {
      return NextResponse.json(
        {
          error: `Free tier message limit of ${FREE_TIER_MESSAGE_LIMIT} reached. Please upgrade to continue.`,
        },
        { status: 429 }, // "Too Many Requests"
      );
    }

    // --- 3. Get Request Body and Prepare for AI Call ---
    const { userMessage, chatHistory, systemPrompt, personaId }: RequestBody =
      await request.json();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("Gemini API key not configured on the server.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 },
      );
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: userMessage }] },
      ],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    // --- 4. Call Gemini API ---
    const apiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await apiResponse.json();

    // --- 5. Robust Response Handling (The Main Fix) ---
    // This block handles cases where the API returns an error or blocks the request.
    if (
      !apiResponse.ok ||
      !responseData.candidates ||
      responseData.candidates.length === 0
    ) {
      console.error("Gemini API Error:", responseData);

      const safetyFeedback = responseData.promptFeedback?.blockReason;
      const errorMessage = safetyFeedback
        ? `Request blocked by AI for safety reasons: ${safetyFeedback}. Please rephrase your message.`
        : "Failed to get a valid response from the AI model.";

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const botResponseText =
      responseData.candidates[0]?.content?.parts[0]?.text ||
      "I'm sorry, I couldn't generate a response.";

    // --- 6. Update Database ---
    // We only increment the count and save history if the API call was successful.
    await User.updateOne({ _id: userId }, { $inc: { monthlyMessageCount: 1 } });

    const newUserMessageDoc = { role: "user", parts: [{ text: userMessage }] };
    const newBotMessageDoc = {
      role: "model",
      parts: [{ text: botResponseText }],
    };

    await ChatSession.findOneAndUpdate(
      { userId: userId, personaId: new Types.ObjectId(personaId) },
      { $push: { messages: { $each: [newUserMessageDoc, newBotMessageDoc] } } },
      { upsert: true, new: true },
    );

    // --- 7. Send Success Response ---
    return NextResponse.json({ botMessage: botResponseText }, { status: 200 });
  } catch (error) {
    // This catches any other unexpected errors in the code.
    console.error("API Route Unhandled Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
