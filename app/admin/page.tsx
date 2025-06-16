"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUsers, FiMessageSquare, FiBox } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TooltipProps } from 'recharts';

interface TopBot {
  _id: string;
  name: string;
  imageUrl: string;
  chatCount: number;
}

interface AdminStats {
  userCount: number;
  personaCount: number;
  chatCount: number;
  topBots: TopBot[];
}

// Custom YAxis tick for avatars and names
const CustomYAxisTick = (props: any) => {
  const { x, y, payload, index, stats } = props;
  const bot = stats.topBots[index];
  return (
    <g transform={`translate(${x},${y})`}>
      {bot.imageUrl ? (
        <image href={bot.imageUrl} x={-40} y={-16} width={32} height={32} style={{ borderRadius: '50%' }} />
      ) : (
        <circle cx={-24} cy={0} r={16} fill="url(#avatarGradient)" />
      )}
      <text x={0} y={6} textAnchor="start" fill="#fff" fontSize={16} fontWeight="bold">
        {payload.value}
      </text>
    </g>
  );
};

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
    <div className="space-y-12 max-w-5xl mx-auto py-10">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#FF3366] to-[#6C63FF] bg-clip-text text-transparent mb-8">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[#1A1A2E] border-[#FF3366]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <FiUsers className="text-[#FF3366] h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userCount}</div>
            <p className="text-gray-400 text-xs">Total registered users</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A2E] border-[#FF3366]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personas</CardTitle>
            <FiBox className="text-[#6C63FF] h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.personaCount}</div>
            <p className="text-gray-400 text-xs">Total AI personas created</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A2E] border-[#FF3366]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <FiMessageSquare className="text-[#00F5FF] h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.chatCount}</div>
            <p className="text-gray-400 text-xs">Total chat sessions started</p>
          </CardContent>
        </Card>
      </div>
      {/* Top 5 Used Bots Chart */}
      <Card className="bg-[#1A1A2E] border-[#FF3366]/20 mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-[#FF3366] to-[#6C63FF] bg-clip-text text-transparent">Top 5 Most Used Bots</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topBots && stats.topBots.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.topBots} layout="vertical" margin={{ left: 40, right: 40, top: 20, bottom: 20 }}>
                <XAxis type="number" stroke="#fff" tick={{ fill: '#fff', fontSize: 14 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#fff"
                  tick={<CustomYAxisTick stats={stats} />}
                  width={180}
                />
                <Tooltip
                  content={({ active, payload }: TooltipProps<any, any>) =>
                    active && payload && payload.length ? (
                      <div className="bg-[#1A1A2E] border border-[#FF3366]/20 p-2 rounded-lg text-white">
                        <div className="flex items-center gap-2 mb-1">
                          {payload[0].payload.imageUrl ? (
                            <img src={payload[0].payload.imageUrl} alt={payload[0].payload.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF3366] to-[#6C63FF] text-white font-bold flex items-center justify-center">{payload[0].payload.name.charAt(0).toUpperCase()}</span>
                          )}
                          <span className="font-bold">{payload[0].payload.name}</span>
                        </div>
                        <div>Chats: <span className="font-bold text-[#FF3366]">{payload[0].payload.chatCount}</span></div>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="chatCount" radius={[0, 8, 8, 0]}>
                  {stats.topBots.map((bot, i) => (
                    <Cell key={bot._id} fill={i % 2 === 0 ? "#FF3366" : "#6C63FF"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400">No data available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
