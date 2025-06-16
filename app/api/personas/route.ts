import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Persona from "@/models/Persona";

export async function GET() {
  try {
    await dbConnect();
    const personas = await Persona.find({}).sort({ name: 1 }); // Sort by name
    return NextResponse.json(personas, { status: 200 });
  } catch (error) {
    console.error("API Error fetching personas:", error);
    return NextResponse.json(
      { message: "Failed to fetch personas" },
      { status: 500 }
    );
  }
}
