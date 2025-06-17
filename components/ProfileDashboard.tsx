"use client"; // This tells Next.js to only run this component in the browser

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import TransitionLink from "./TransitionLink";

// This component receives the user data as props from the server page
export default function ProfileDashboard({
  userData,
  personaLimit,
  messageLimit,
}: any) {
  if (!userData) return null;

  const personaChartData = [
    { name: "Usage", created: userData.personasCreated },
  ];
  const messageChartData = [{ name: "Usage", sent: userData.messagesSent }];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Your current plan and its features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-primary text-3xl font-bold capitalize">
            {userData.tier} Tier
          </div>
          <p className="text-muted-foreground">
            {userData.tier === "free"
              ? "You are on the free plan with basic access."
              : "You have unlocked all premium features. Thank you for your support!"}
          </p>
          {userData.tier === "free" && (
            <TransitionLink href="/pricing">
              <Button className="w-full">Upgrade to Premium</Button>
            </TransitionLink>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personas Created</CardTitle>
          <CardDescription>
            You have created {userData.personasCreated} of your{" "}
            {userData.tier === "free" ? personaLimit : "unlimited"} allowed
            personas.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <ResponsiveContainer width="100%" height={50}>
            <BarChart data={personaChartData} layout="vertical">
              <XAxis
                type="number"
                hide
                domain={[
                  0,
                  userData.tier === "free"
                    ? personaLimit
                    : userData.personasCreated,
                ]}
              />
              <YAxis type="category" dataKey="name" hide />
              <Bar
                dataKey="created"
                fill="hsl(var(--primary))"
                radius={[4, 4, 4, 4]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Message Usage</CardTitle>
          <CardDescription>
            You have sent {userData.messagesSent} of your{" "}
            {userData.tier === "free" ? messageLimit : "unlimited"} messages
            this month.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <ResponsiveContainer width="100%" height={50}>
            <BarChart data={messageChartData} layout="vertical">
              <XAxis
                type="number"
                hide
                domain={[
                  0,
                  userData.tier === "free"
                    ? messageLimit
                    : userData.messagesSent,
                ]}
              />
              <YAxis type="category" dataKey="name" hide />
              <Bar
                dataKey="sent"
                fill="hsl(var(--primary))"
                radius={[4, 4, 4, 4]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
