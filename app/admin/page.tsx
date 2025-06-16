"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUsers, FiMessageSquare, FiBox } from "react-icons/fi";

interface AdminStats {
  userCount: number;
  personaCount: number;
  chatCount: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");

        if (response.status === 403) {
          throw new Error(
            "Access Denied: You do not have permission to view this page.",
          );
        }
        if (!response.ok) {
          throw new Error("Failed to fetch admin statistics.");
        }

        const data: AdminStats = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="py-10 text-center">Loading Admin Dashboard...</div>;
  }

  if (error) {
    return <div className="text-destructive py-10 text-center">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <FiUsers className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userCount}</div>
            <p className="text-muted-foreground text-xs">
              Total registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Personas
            </CardTitle>
            <FiBox className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.personaCount}</div>
            <p className="text-muted-foreground text-xs">
              Total AI personas created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversations
            </CardTitle>
            <FiMessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.chatCount}</div>
            <p className="text-muted-foreground text-xs">
              Total chat sessions started
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
