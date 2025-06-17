import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs"; // Make sure bcryptjs is installed: `npm install bcryptjs`

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists." },
        { status: 409 }, // Conflict
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
      subscriptionTier: "free", // Default tier
      personasCreated: 0,
      monthlyMessageCount: 0,
    });

    // Do not return the password hash
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { message: "Registration successful!", user: userResponse },
      { status: 201 }, // Created
    );
  } catch (error) {
    console.error("User registration API error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred during registration." },
      { status: 500 },
    );
  }
}
