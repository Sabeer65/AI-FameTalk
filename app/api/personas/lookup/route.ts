import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

interface RequestBody {
  name: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GEMINI_API_KEY || !SERPAPI_API_KEY) {
    return NextResponse.json(
      { error: "API keys not configured" },
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
      For the famous person named "${name}", generate a structured JSON object with the following exact keys: "name" (their full official name), "description" (a concise one-sentence summary), "category" (a single relevant category), "gender" (which must be 'male', 'female', or 'neutral'), and "systemPrompt" (a detailed set of instructions for an AI to act as this person). Only return the raw JSON object.
    `;

    const geminiPayload = {
      contents: [{ parts: [{ text: generationPrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiResponse.ok)
      throw new Error(
        `Gemini API responded with status ${geminiResponse.status}`,
      );

    const geminiData = await geminiResponse.json();
    const personaTextData = JSON.parse(
      geminiData.candidates[0].content.parts[0].text,
    );
    const officialName = personaTextData.name;

    const serpApiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(`${officialName} portrait`)}&tbm=isch&api_key=${SERPAPI_API_KEY}`;

    const serpApiResponse = await fetch(serpApiUrl);
    if (!serpApiResponse.ok)
      throw new Error("Failed to fetch image from SerpApi.");

    const serpApiData = await serpApiResponse.json();
    const imageUrl = serpApiData.images_results?.[0]?.original;

    if (!imageUrl)
      throw new Error(`Could not find a suitable image for "${officialName}".`);

    const finalPersonaProfile = {
      ...personaTextData,
      imageUrl: imageUrl,
    };

    return NextResponse.json(finalPersonaProfile, { status: 200 });
  } catch (error: any) {
    console.error("Lookup API Error:", error);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred" },
      { status: 500 },
    );
  }
}
