// This is the full code for the file: components/AdminDashboard.tsx
// It replaces the entire existing content of this file.

"use client";

import { useState } from "react";
import { IPersona, IUser } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminDashboardProps {
  initialUsers: IUser[];
  initialPersonas: IPersona[];
}

export default function AdminDashboard({
  // THE FIX: Default props to an empty array to prevent the 'map' error
  initialUsers = [],
  initialPersonas = [],
}: AdminDashboardProps) {
  const [users, setUsers] = useState(initialUsers);
  const [personas, setPersonas] = useState(initialPersonas);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "user" | "persona";
  } | null>(null);

  const handleDeleteClick = (
    id: string,
    name: string,
    type: "user" | "persona",
  ) => {
    setItemToDelete({ id, name, type });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const { id, name, type } = itemToDelete;
    const url =
      type === "user" ? `/api/admin/users/${id}` : `/api/admin/personas/${id}`;

    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to delete ${type}.`);
      }

      if (type === "user") {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        setPersonas((prev) => prev.filter((p) => p._id !== id));
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} Deleted`, {
        description: `"${name}" has been removed successfully.`,
      });
    } catch (err: any) {
      toast.error("Deletion Failed", { description: err.message });
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.subscriptionTier}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="text-red-500"
                            onSelect={() =>
                              handleDeleteClick(
                                user._id,
                                user.email || "user",
                                "user",
                              )
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
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

        <Card>
          <CardHeader>
            <CardTitle>Personas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personas.map((persona) => (
                  <TableRow key={persona._id}>
                    <TableCell>{persona.name}</TableCell>
                    <TableCell>{persona.category}</TableCell>
                    <TableCell>
                      {persona.isDefault ? "Default" : "User-Created"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="text-red-500"
                            onSelect={() =>
                              handleDeleteClick(
                                persona._id,
                                persona.name,
                                "persona",
                              )
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Persona
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
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {itemToDelete?.type} "{itemToDelete?.name}" and all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
