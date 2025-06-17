"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUsers, FiMessageSquare, FiStar, FiBarChart2 } from "react-icons/fi";
import TypingLoader from "@/components/TypingLoader";

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalMessages: number;
}

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <Card className="hover:shadow-primary/20 transform transition-all duration-300 hover:-translate-y-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-muted-foreground text-sm font-medium">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || session?.user.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch admin statistics");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated" && session.user.role === "admin") {
      fetchStats();
    }
  }, [session, status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="flex h-full min-h-[calc(100vh-200px)] items-center justify-center">
        <TypingLoader />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center">
        Could not load administrator statistics.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tighter">Admin Dashboard</h1>
        <FiBarChart2 className="text-primary h-10 w-10" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FiUsers className="text-muted-foreground h-5 w-5" />}
        />
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers}
          icon={<FiStar className="text-muted-foreground h-5 w-5" />}
        />
        <StatCard
          title="Total Messages"
          value={stats.totalMessages}
          icon={<FiMessageSquare className="text-muted-foreground h-5 w-5" />}
        />
      </div>
    </div>
  );
}
