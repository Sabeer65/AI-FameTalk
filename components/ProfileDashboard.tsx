"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiStar, FiClock, FiArrowRight } from "react-icons/fi";
import { Session } from "next-auth";
import { Button } from "./ui/button";
import TransitionLink from "./TransitionLink";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import TypingLoader from "./TypingLoader";

interface ChatSession {
  _id: string;
  personaId: {
    _id: string;
    name: string;
    imageUrl: string;
  };
}

export default function ProfileDashboard({ session }: { session: Session }) {
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSessions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/chathistory");
        if (res.ok) {
          const data = await res.json();
          setRecentSessions(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch recent sessions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentSessions();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiClock /> Recent Conversations
            </CardTitle>
            <CardDescription>Jump back into your recent chats.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <TypingLoader />
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((s) => (
                  <TransitionLink
                    key={s._id}
                    href={`/chat?personaId=${s.personaId._id}`}
                    className="hover:bg-accent -m-3 flex items-center rounded-lg p-3 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={s.personaId.imageUrl} />
                      <AvatarFallback>
                        {s.personaId.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-grow">
                      <p className="font-semibold">{s.personaId.name}</p>
                    </div>
                    <FiArrowRight className="text-muted-foreground h-5 w-5" />
                  </TransitionLink>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                No recent conversations. Start a new chat to see it here!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your billing and plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              You are currently on the{" "}
              <span className="text-primary font-bold">
                {session.user.tier}
              </span>{" "}
              plan.
            </p>
            {session.user.tier === "Free" && (
              <TransitionLink href="/pricing">
                <Button className="w-full">
                  <FiStar className="mr-2" /> Upgrade to Premium
                </Button>
              </TransitionLink>
            )}
            {session.user.tier === "Premium" && (
              <Button variant="outline" className="w-full" disabled>
                Manage Billing
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
