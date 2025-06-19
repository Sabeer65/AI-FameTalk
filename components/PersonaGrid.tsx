"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
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
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
import { IPersona } from "@/types";

// Define the shape of the session object we get from the parent
interface Session {
  user?: {
    id?: string | null;
    role?: string | null;
  };
}

interface PersonaGridProps {
  initialPersonas: IPersona[];
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
  const [personaToDelete, setPersonaToDelete] = useState<IPersona | null>(null);

  const categories = useMemo<string[]>(() => {
    if (!personas) return ["All"];
    const uniqueCategories = new Set(personas.map((p) => p.category));
    return ["All", ...Array.from(uniqueCategories)];
  }, [personas]);

  const filteredPersonas = useMemo(() => {
    if (!personas) return [];
    return personas
      .filter((p) => activeCategory === "All" || p.category === activeCategory)
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [personas, activeCategory, searchQuery]);

  const handleDeleteClick = (persona: IPersona) => {
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
          <FiSearch className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search for a persona..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <TransitionLink href="/personas/create">
          <Button>
            <FiPlus className="mr-2 h-4 w-4" />
            Find Persona
          </Button>
        </TransitionLink>
        <TransitionLink href="/personas/custom">
          <Button variant="secondary">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredPersonas.map((persona) => {
          const canManage =
            session?.user &&
            (session.user.id === persona.creatorId ||
              session.user.role === "admin");
          return (
            <Card
              key={persona._id}
              className="group border-border/50 bg-card/50 hover:shadow-primary/10 relative flex h-80 flex-col justify-end overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <img
                src={persona.imageUrl}
                alt={persona.name}
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {canManage && (
                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 border-none bg-black/50 hover:bg-black/70"
                      >
                        <FiMoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <FiEdit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(persona);
                        }}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <FiTrash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <div className="relative z-10 flex flex-col p-4">
                <Badge variant="secondary" className="mb-2 w-fit">
                  {persona.category}
                </Badge>
                <CardTitle className="text-xl font-bold text-white">
                  {persona.name}
                </CardTitle>
                <p className="mt-1 line-clamp-2 text-sm text-white/80">
                  {persona.description}
                </p>
                <TransitionLink
                  href={`/chat?personaId=${persona._id}`}
                  className="mt-4 w-full"
                >
                  <Button
                    variant="secondary"
                    className="w-full bg-white/10 text-white backdrop-blur-lg hover:bg-white/20"
                  >
                    <FiMessageSquare className="mr-2 h-4 w-4" /> Chat Now
                  </Button>
                </TransitionLink>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredPersonas.length === 0 && (
        <div className="col-span-full py-24 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            No personas found
          </h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or selected category.
          </p>
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
