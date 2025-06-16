import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

interface RequestBody {
  name: string;
}

interface PersonaProfile {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  systemPrompt: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 },
    );
  }

  try {
    const { name }: RequestBody = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: "Persona name is required" },
        { status: 400 },
      );
    }

    const generationPrompt = `
      For the famous person named "${name}", generate a structured JSON object with the following exact keys: "name" (their full official name), "description" (a concise one-sentence summary of who they are), "category" (a single relevant category like 'Science', 'Art', 'History', 'Sports', 'Literature', or 'Philosophy'), "imageUrl" (a publicly accessible, working URL to a high-quality portrait image of the person), and "systemPrompt" (a detailed set of instructions for an AI chatbot to convincingly act as this person, written in the third person, detailing their personality, key achievements, and speaking style). Only return the raw JSON object, with no extra text or markdown formatting.
    `;

    const payload = {
      contents: [
        {
          parts: [{ text: generationPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const apiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      throw new Error(`Gemini API responded with status ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();
    const rawTextResponse = responseData.candidates[0]?.content?.parts[0]?.text;
    const personaProfile: PersonaProfile = JSON.parse(rawTextResponse);

    if (
      !personaProfile.name ||
      !personaProfile.description ||
      !personaProfile.imageUrl ||
      !personaProfile.systemPrompt
    ) {
      throw new Error(
        "AI failed to generate a complete profile. Please try again.",
      );
    }

    return NextResponse.json(personaProfile, { status: 200 });
  } catch (error: any) {
    console.error("Lookup API Error:", error);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred" },
      { status: 500 },
    );
  }
}
