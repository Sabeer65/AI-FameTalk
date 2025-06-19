"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  FiUsers,
  FiBox,
  FiMessageSquare,
  FiMoreVertical,
  FiShield,
  FiTrash2,
} from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { IUser, IPersona } from "@/types";

// THE FIX: The props interface now expects `users` and `personas`
interface AdminDashboardProps {
  stats: {
    userCount: number;
    personaCount: number;
    chatCount: number;
  };
  users: IUser[];
  personas: IPersona[];
}

export default function AdminDashboard({
  stats,
  users: initialUsers,
  personas: initialPersonas,
}: AdminDashboardProps) {
  const [users, setUsers] = useState(initialUsers);
  const [personas, setPersonas] = useState(initialPersonas);

  const handleRoleChange = async (
    userId: string,
    currentRole: "user" | "admin",
  ) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "Promoting" : "Demoting";

    toast.info(`${action} user...`);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const updatedUser = await response.json();
      if (!response.ok)
        throw new Error(updatedUser.error || "Failed to update role.");

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user,
        ),
      );

      toast.success(`User successfully updated to ${newRole}.`);
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message });
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="personas">Personas</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <FiUsers className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.userCount}</div>
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
              <div className="text-2xl font-bold">{stats.personaCount}</div>
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
              <div className="text-2xl font-bold">{stats.chatCount}</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.image} />
                          <AvatarFallback>
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.subscriptionTier === "premium"
                            ? "default"
                            : "outline"
                        }
                      >
                        {user.subscriptionTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <FiMoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              handleRoleChange(user._id.toString(), user.role)
                            }
                          >
                            <FiShield className="mr-2 h-4 w-4" />
                            {user.role === "admin"
                              ? "Demote to User"
                              : "Promote to Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <FiTrash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="personas" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Persona Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personas.map((persona) => (
                  <TableRow key={persona._id.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={persona.imageUrl} />
                          <AvatarFallback>
                            {persona.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{persona.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{persona.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={persona.isDefault ? "secondary" : "outline"}
                      >
                        {persona.isDefault ? "Default" : "User-Created"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <FiMoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive">
                            Delete Persona
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
