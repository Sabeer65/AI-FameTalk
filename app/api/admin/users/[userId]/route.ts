// This is a new file. Create it at: app/api/admin/users/[userId]/route.ts
// The full code for the new file is below.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Persona from "@/models/Persona";
import ChatSession from "@/models/ChatSession";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  const session = await getServerSession(authOptions);

  // --- 1. Authorization Check ---
  // Ensure the user is logged in and is an admin.
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    // --- 2. Delete all associated data first ---
    // Delete user-created personas
    await Persona.deleteMany({ creatorId: userId, isDefault: false });
    // Delete user's chat sessions
    await ChatSession.deleteMany({ userId: userId });

    // --- 3. Delete the user ---
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User and all associated data deleted successfully.",
    });
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
