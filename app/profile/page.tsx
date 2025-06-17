import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileDashboard from "@/components/ProfileDashboard"; // Import our new client component

const FREE_TIER_PERSONA_LIMIT = 3;
const FREE_TIER_MESSAGE_LIMIT = 100;

async function getUserData() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return null;
  }
  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) return null;

  return JSON.parse(JSON.stringify(user));
}

export default async function ProfilePage() {
  const userData = await getUserData();

  if (!userData) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      {/* User Profile Header stays on the server */}
      <div className="flex items-center space-x-6">
        <Avatar className="border-primary h-24 w-24 border-2">
          <AvatarImage
            src={userData.image || ""}
            alt={userData.name || "User"}
          />
          <AvatarFallback className="text-3xl">
            {userData.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{userData.name}</h1>
          <p className="text-muted-foreground">{userData.email}</p>
        </div>
      </div>

      {/* We render the client component and pass the data to it as props */}
      <ProfileDashboard
        userData={{
          tier: userData.subscriptionTier,
          personasCreated: userData.personasCreated,
          messagesSent: userData.monthlyMessageCount,
        }}
        personaLimit={FREE_TIER_PERSONA_LIMIT}
        messageLimit={FREE_TIER_MESSAGE_LIMIT}
      />
    </div>
  );
}
