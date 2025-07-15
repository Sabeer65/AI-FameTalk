// This is a new file. Create the folders and file at: app/personas/edit/[personaId]/page.tsx
// The full code for the new file is below.

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IPersona } from "@/types";

export default function EditPersonaPage() {
  const [persona, setPersona] = useState<IPersona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const personaId = params.personaId;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated" && personaId) {
      const fetchPersona = async () => {
        try {
          const response = await fetch(`/api/personas/${personaId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch persona data.");
          }
          const data = await response.json();
          setPersona(data);
        } catch (error: any) {
          toast.error("Error", { description: error.message });
        } finally {
          setIsLoading(false);
        }
      };
      fetchPersona();
    }
  }, [status, personaId, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persona) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/personas/${personaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(persona),
      });

      if (!response.ok) {
        throw new Error("Failed to update persona.");
      }

      toast.success("Persona Updated!", {
        description: `${persona.name} has been saved.`,
      });
      router.push("/personas");
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setPersona((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading persona...</div>;
  }

  if (!persona) {
    return (
      <div className="container mx-auto p-4">
        Could not load persona for editing.
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="mb-6 text-3xl font-bold">Edit Persona: {persona.name}</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={persona.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={persona.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            value={persona.category}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            name="systemPrompt"
            value={persona.systemPrompt}
            onChange={handleChange}
            rows={10}
            required
          />
        </div>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
