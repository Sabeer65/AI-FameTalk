import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Persona from "@/models/Persona";
import ChatSession from "@/models/ChatSession";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  // 1. Authenticate and Authorize directly on the page
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    // If the user is not an admin, redirect them immediately
    redirect("/");
  }

  // 2. Fetch data directly from the database
  await dbConnect();

  // Fetch all data points in parallel for maximum efficiency
  const [stats, users, personas] = await Promise.all([
    // Fetch stats
    (async () => {
      const [userCount, personaCount, chatCount] = await Promise.all([
        User.countDocuments(),
        Persona.countDocuments(),
        ChatSession.countDocuments(),
      ]);
      return { userCount, personaCount, chatCount };
    })(),
    // Fetch users
    User.find({}).sort({ createdAt: -1 }).lean(),
    // Fetch personas
    Persona.find({}).sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      {/* 3. Pass the real, live data as props to our UI component */}
      <AdminDashboard
        stats={stats}
        // We must stringify and parse to pass complex objects from Server to Client Components
        users={JSON.parse(JSON.stringify(users))}
        personas={JSON.parse(JSON.stringify(personas))}
      />
    </div>
  );
}
