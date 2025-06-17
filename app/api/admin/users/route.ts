import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User, { IUser } from "@/models/User"; // Import IUser interface

// GET all users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await dbConnect();
    // Fetch users and explicitly cast to IUser[] (or a subset if you only need certain fields)
    const users = (await User.find({}).select("-password").lean()) as IUser[];
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Admin GET Users Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// PATCH/PUT update user (example: change role or reset counts)
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, updates } = await request.json();

  if (!userId || !updates) {
    return NextResponse.json(
      { error: "Missing userId or updates" },
      { status: 400 },
    );
  }

  try {
    await dbConnect();
    // Find user and explicitly type the result before modification
    const user = (await User.findById(userId)) as IUser;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    Object.assign(user, updates);
    await user.save();

    return NextResponse.json(
      { message: "User updated successfully", user },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin PATCH User Error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE a user
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await dbConnect();
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin DELETE User Error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
