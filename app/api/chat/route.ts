import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import { Types } from "mongoose";

// Define the shape of the incoming request body
interface RequestBody {
  userMessage: string;
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[];
  systemPrompt: string;
  personaId: string; // We now need to know which persona we're talking to
  userId?: string; // Optional for now, will be required with authentication
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  try {
    const {
      userMessage,
      chatHistory,
      systemPrompt,
      personaId,
      userId = "anonymous_user",
    }: RequestBody = await request.json();

    if (!userMessage || !chatHistory || !systemPrompt || !personaId) {
      return NextResponse.json(
        { error: "Missing required fields in request" },
        { status: 400 }
      );
    }

    // --- Step 1: Get AI Response ---
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
      console.error("Gemini API Error:", await apiResponse.text());
      throw new Error("Failed to get response from Gemini API");
    }

    const responseData = await apiResponse.json();
    const botResponseText =
      responseData.candidates[0]?.content?.parts[0]?.text ||
      "I'm sorry, I couldn't generate a response.";

    // --- Step 2: Save conversation to Database ---
    await dbConnect();

    // The two new messages to be saved
    const newUserMessageDoc = { role: "user", parts: [{ text: userMessage }] };
    const newBotMessageDoc = {
      role: "model",
      parts: [{ text: botResponseText }],
    };

    // Find the chat session for this user and persona, or create it if it doesn't exist
    await ChatSession.findOneAndUpdate(
      { userId: userId, personaId: new Types.ObjectId(personaId) },
      {
        $push: {
          messages: { $each: [newUserMessageDoc, newBotMessageDoc] },
        },
      },
      {
        upsert: true, // This creates the document if it doesn't exist
        new: true, // Returns the modified document
      }
    );

    return NextResponse.json({ botMessage: botResponseText }, { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
