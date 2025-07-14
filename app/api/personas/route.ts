import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Persona from "@/models/Persona";

const FREE_TIER_PERSONA_LIMIT = 3;

// This GET function fetches the personas for the main library page
export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Build a query that finds default personas OR personas created by the current user
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

// This POST function creates a new persona
export async function POST(request: Request) {
  // 1. AUTHENTICATION: Ensure user is logged in
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
    const {
      name,
      description,
      category,
      imageUrl,
      systemPrompt,
      gender,
      isCustom,
    } = body;

    // Basic validation for all required fields
    if (
      !name ||
      !description ||
      !systemPrompt ||
      !imageUrl ||
      !category ||
      !gender
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    await dbConnect();

    // 2. AUTHORIZATION & BUSINESS LOGIC: Check user's tier and limits
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Rule A: Block free users from creating custom personas
    if (isCustom && user.subscriptionTier === "free") {
      return NextResponse.json(
        {
          error:
            "Creating custom personas is a premium feature. Please upgrade.",
        },
        { status: 403 }, // 403 Forbidden
      );
    }

    // Rule B: Block free users if they've reached their persona creation limit
    if (
      user.subscriptionTier === "free" &&
      user.personasCreated >= FREE_TIER_PERSONA_LIMIT
    ) {
      return NextResponse.json(
        {
          error: `Free tier limit of ${FREE_TIER_PERSONA_LIMIT} personas reached. Please upgrade.`,
        },
        { status: 403 },
      );
    }

    // 3. IMAGE VALIDATION: Check if the image URL is valid
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

    // 4. DATABASE WRITE: Create the new persona and update the user's count
    const newPersona = await Persona.create({
      name,
      description,
      category,
      imageUrl,
      systemPrompt,
      gender,
      creatorId: userId, // Link the persona to the logged-in user
      isDefault: false, // User-created personas are never defaults
    });

    // Increment the user's persona creation count
    await User.updateOne({ _id: userId }, { $inc: { personasCreated: 1 } });

    return NextResponse.json(newPersona, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Create Persona API Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
