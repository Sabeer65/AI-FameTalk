import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // Import our auth config
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import { Types } from "mongoose";

interface RequestBody {
  userMessage: string;
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[];
  systemPrompt: string;
  personaId: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: Request) {
  // --- Step 1: Get the current user's session ---
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 },
    );
  }

  // We now have the real user's ID
  const userId = session.user.id;

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 },
    );
  }

  try {
    const { userMessage, chatHistory, systemPrompt, personaId }: RequestBody =
      await request.json();

    if (!userMessage || !chatHistory || !systemPrompt || !personaId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // --- Step 2: Get AI Response (No change here) ---
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

    // --- Step 3: Save conversation using the REAL user ID ---
    await dbConnect();

    const newUserMessageDoc = { role: "user", parts: [{ text: userMessage }] };
    const newBotMessageDoc = {
      role: "model",
      parts: [{ text: botResponseText }],
    };

    await ChatSession.findOneAndUpdate(
      // The query now uses the real userId from the session
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
