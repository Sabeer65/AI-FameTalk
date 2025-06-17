import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import ChatSession from "@/models/ChatSession";
import Persona from "@/models/Persona";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      message: userMessage,
      personaId,
      sessionId: existingSessionId,
    } = await request.json();

    if (!userMessage || !personaId) {
      return NextResponse.json(
        { error: "Message and personaId are required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const persona = await Persona.findById(personaId);
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    let chatSession;
    if (existingSessionId) {
      chatSession = await ChatSession.findById(existingSessionId);
    }

    if (!chatSession) {
      chatSession = new ChatSession({
        userId: session.user.id,
        personaId: personaId,
        messages: [],
      });
    }

    const chatHistory = chatSession.messages.map((msg: any) => ({
      role: msg.role,
      parts: msg.parts.map((part: any) => ({ text: part.text })),
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 200,
      },
      systemInstruction: persona.systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    chatSession.messages.push({ role: "user", parts: [{ text: userMessage }] });
    chatSession.messages.push({ role: "model", parts: [{ text: text }] });

    await chatSession.save();

    return NextResponse.json(
      { text: text, newSessionId: chatSession._id.toString() },
      { status: 200 },
    );
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
