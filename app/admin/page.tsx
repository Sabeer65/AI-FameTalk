// This is the full code for the file: app/admin/page.tsx
// It replaces the entire existing content of this file.

import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Persona from "@/models/Persona";
import AdminDashboard from "@/components/AdminDashboard";
import AdminCharts from "@/components/AdminCharts"; // 1. IMPORT THE CHART COMPONENT
import { Skeleton } from "@/components/ui/skeleton";

// Data fetching component for the tables
async function AdminDashboardLoader() {
  await dbConnect();
  const usersPromise = User.find({}).sort({ createdAt: -1 }).lean();
  const personasPromise = Persona.find({}).sort({ createdAt: -1 }).lean();
  const [users, personas] = await Promise.all([usersPromise, personasPromise]);
  const plainUsers = JSON.parse(JSON.stringify(users));
  const plainPersonas = JSON.parse(JSON.stringify(personas));
  return (
    <AdminDashboard initialUsers={plainUsers} initialPersonas={plainPersonas} />
  );
}

// Skeleton for the tables
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <Skeleton className="mb-4 h-10 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="mb-4 h-10 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

// 2. CREATE A SKELETON FOR THE CHART
function ChartSkeleton() {
  return (
    <Skeleton className="col-span-1 h-[450px] w-full md:col-span-2 lg:col-span-3" />
  );
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="container mx-auto space-y-8 py-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* 3. ADD THE CHART COMPONENT WITH SUSPENSE */}
      <Suspense fallback={<ChartSkeleton />}>
        <AdminCharts />
      </Suspense>

      <Suspense fallback={<DashboardSkeleton />}>
        <AdminDashboardLoader />
      </Suspense>
    </div>
  );
}
