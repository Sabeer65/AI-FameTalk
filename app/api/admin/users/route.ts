import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest } from "next/server";

// This function handles PATCH requests to update a user's role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  // 1. Authenticate and authorize the admin
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { role } = body;

    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 },
      );
    }

    await dbConnect();

    // 2. Find the user and update their role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { role: role } },
      { new: true }, // Return the updated document
    ).select("-password"); // Exclude password from the response

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Admin Update User Role Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
