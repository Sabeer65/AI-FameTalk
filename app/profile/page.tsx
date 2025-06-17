import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ProfileDashboard from "@/components/ProfileDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiUser, FiMail, FiStar } from "react-icons/fi";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Avatar className="border-primary h-24 w-24 border-4">
              <AvatarImage
                src={session.user.image ?? ""}
                alt={session.user.name ?? "User"}
              />
              <AvatarFallback className="text-4xl">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-4xl font-bold">
                {session.user.name}
              </CardTitle>
              <div className="mt-2 flex flex-wrap justify-center gap-4 sm:justify-start">
                <Badge
                  variant={
                    session.user.tier === "Premium" ? "default" : "secondary"
                  }
                  className="flex items-center gap-2 px-3 py-1 text-sm"
                >
                  {session.user.tier === "Premium" ? <FiStar /> : <FiUser />}
                  {session.user.tier} Plan
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-muted-foreground flex items-center gap-4">
            <FiMail className="h-5 w-5" />
            <span>{session.user.email}</span>
          </div>
        </CardContent>
      </Card>
      <ProfileDashboard session={session} />
    </div>
  );
}
