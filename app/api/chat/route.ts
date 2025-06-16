import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import User from "@/models/User"; // Import the User model
import { Types } from "mongoose";

const FREE_TIER_MESSAGE_LIMIT = 100;

interface RequestBody {
  userMessage: string;
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[];
  systemPrompt: string;
  personaId: string;
}

export async function POST(request: Request) {
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

    // --- Step 1: Check User's Message Limit ---
    const user = await User.findById(userId);

    if (!user) {
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
        { status: 429 }, // 429 is the "Too Many Requests" status code
      );
    }

    // --- Step 2: Get AI Response (No change here) ---
    const { userMessage, chatHistory, systemPrompt, personaId }: RequestBody =
      await request.json();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: userMessage }] },
      ],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const apiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      throw new Error("Failed to get response from Gemini API");
    }

    const responseData = await apiResponse.json();
    const botResponseText =
      responseData.candidates[0]?.content?.parts[0]?.text ||
      "I'm sorry, I couldn't generate a response.";

    // --- Step 3: Increment User's Message Count & Save Chat ---
    // We only increment the count if the API call was successful.
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

    return NextResponse.json({ botMessage: botResponseText }, { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
