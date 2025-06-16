import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Persona from "@/models/Persona";

const FREE_TIER_PERSONA_LIMIT = 3;

export async function GET() {
  try {
    await dbConnect();
    // We fetch default personas AND user-created personas for the logged-in user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const query = userId
      ? { $or: [{ isDefault: true }, { creatorId: userId }] }
      : { isDefault: true };

    const personas = await Persona.find(query).sort({ name: 1 });
    return NextResponse.json(personas, { status: 200 });
  } catch (error) {
    console.error("API GET Personas Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  // 1. AUTHENTICATION
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  try {
    const body = await request.json();
    const { name, description, category, imageUrl, systemPrompt, isCustom } =
      body;

    if (!name || !description || !systemPrompt || !imageUrl || !category) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    await dbConnect();

    // 2. AUTHORIZATION & BUSINESS LOGIC
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (isCustom && user.subscriptionTier === "free") {
      return NextResponse.json(
        { error: "Creating custom personas is a premium feature." },
        { status: 403 },
      );
    }

    if (
      user.subscriptionTier === "free" &&
      user.personasCreated >= FREE_TIER_PERSONA_LIMIT
    ) {
      return NextResponse.json(
        {
          error: `Free tier limit of ${FREE_TIER_PERSONA_LIMIT} personas reached.`,
        },
        { status: 403 },
      );
    }

    // 3. IMAGE VALIDATION
    try {
      const imageResponse = await fetch(imageUrl, { method: "HEAD" });
      if (
        !imageResponse.ok ||
        !imageResponse.headers.get("content-type")?.startsWith("image/")
      ) {
        throw new Error();
      }
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid or inaccessible Image URL provided." },
        { status: 400 },
      );
    }

    // 4. DATABASE WRITE
    const newPersona = await Persona.create({
      name,
      description,
      category,
      imageUrl,
      systemPrompt,
      creatorId: userId,
      isDefault: false,
    });

    await User.updateOne({ _id: userId }, { $inc: { personasCreated: 1 } });

    return NextResponse.json(newPersona, { status: 201 });
  } catch (error) {
    console.error("Create Persona API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
