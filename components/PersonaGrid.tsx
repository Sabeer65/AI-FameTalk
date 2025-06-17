"use client";

import React, { useState, useMemo } from "react";
import TransitionLink from "./TransitionLink";
import {
  FiSearch,
  FiMessageSquare,
  FiPlus,
  FiPenTool,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";

interface Persona {
  _id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  isDefault: boolean;
  creatorId: string;
}

interface Session {
  user?: {
    id?: string;
    role?: string;
  };
}

interface PersonaGridProps {
  initialPersonas: Persona[];
  session: Session | null;
}

export default function PersonaGrid({
  initialPersonas,
  session,
}: PersonaGridProps) {
  const [personas, setPersonas] = useState(initialPersonas || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);

  const categories = useMemo<string[]>(() => {
    if (!personas) return ["All"];
    const uniqueCategories = new Set(personas.map((p: Persona) => p.category));
    return ["All", ...Array.from(uniqueCategories)];
  }, [personas]);

  const filteredPersonas = useMemo(() => {
    if (!personas) return [];
    return personas
      .filter((p) => activeCategory === "All" || p.category === activeCategory)
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [personas, activeCategory, searchQuery]);

  const handleDeleteClick = (persona: Persona) => {
    setPersonaToDelete(persona);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!personaToDelete) return;
    try {
      const response = await fetch(`/api/personas/${personaToDelete._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete persona.");
      }
      setPersonas(personas.filter((p) => p._id !== personaToDelete._id));
      toast.success("Persona Deleted", {
        description: `${personaToDelete.name} has been removed.`,
      });
    } catch (err: any) {
      toast.error("Deletion Failed", { description: err.message });
    } finally {
      setShowDeleteDialog(false);
      setPersonaToDelete(null);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <FiSearch className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search personas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
        <TransitionLink href="/personas/create">
          <Button className="w-full md:w-auto">
            <FiPlus className="mr-2 h-4 w-4" />
            Find Persona
          </Button>
        </TransitionLink>
        <TransitionLink href="/personas/custom">
          <Button variant="secondary" className="w-full md:w-auto">
            <FiPenTool className="mr-2 h-4 w-4" />
            Create Custom
          </Button>
        </TransitionLink>
      </div>

      <div className="mb-12 flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPersonas.map((persona) => {
          const canManage =
            session?.user &&
            (session.user.id === persona.creatorId ||
              session.user.role === "admin");
          return (
            <Card
              key={persona._id}
              className="group hover:shadow-primary/40 flex transform flex-col overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="relative p-0">
                <img
                  src={persona.imageUrl}
                  alt={persona.name}
                  className="h-56 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {!persona.isDefault && canManage && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <FiMoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          <FiEdit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(persona)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <FiTrash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <CardTitle className="absolute bottom-4 left-4 text-xl text-white">
                  {persona.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <Badge variant="secondary" className="mb-2">
                  {persona.category}
                </Badge>
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {persona.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <TransitionLink
                  href={`/chat?personaId=${persona._id}`}
                  className="w-full"
                >
                  <Button className="w-full">
                    <FiMessageSquare className="mr-2 h-4 w-4" /> Chat Now
                  </Button>
                </TransitionLink>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredPersonas.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <p className="text-muted-foreground text-lg">No personas found.</p>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              persona "{personaToDelete?.name}" and all of its associated chat
              histories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, delete persona
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
