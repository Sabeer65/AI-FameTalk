"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FiSearch, FiCheck, FiLoader } from "react-icons/fi";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PersonaProfile {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  systemPrompt: string;
  gender: "male" | "female" | "neutral";
}

export default function FindPersonaPage() {
  const router = useRouter();
  const [lookupName, setLookupName] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [foundPersona, setFoundPersona] = useState<PersonaProfile | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupName) return;
    setIsLookingUp(true);
    setFoundPersona(null);
    try {
      const response = await fetch("/api/personas/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lookupName }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to find persona.");
      setFoundPersona(data);
    } catch (err: any) {
      toast.error("Lookup Failed", { description: err.message });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleCreate = async () => {
    if (!foundPersona) return;
    setIsCreating(true);
    try {
      const response = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(foundPersona),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create persona.");

      toast.success("Persona Created!", {
        description: `${data.name} has been added to your library.`,
      });
      router.push("/personas");
    } catch (err: any) {
      toast.error("Creation Failed", { description: err.message });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter">
          Create from a Real Person
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter a name, and we'll use AI to generate a profile for you to
          confirm.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Persona</CardTitle>
          <CardDescription>
            Enter the name of a famous historical or fictional character.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLookup}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Input
              placeholder="e.g., Albert Einstein, Cleopatra..."
              value={lookupName}
              onChange={(e) => setLookupName(e.target.value)}
              disabled={isLookingUp || isCreating}
            />
            <Button
              type="submit"
              disabled={isLookingUp || isCreating || !lookupName}
              className="w-full sm:w-auto"
            >
              {isLookingUp ? (
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FiSearch className="mr-2 h-4 w-4" />
              )}
              Find Persona
            </Button>
          </form>
        </CardContent>
      </Card>

      {foundPersona && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Is this correct?</CardTitle>
            <CardDescription>
              Please confirm the details below before creating the bot.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-6 sm:flex-row">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={foundPersona.imageUrl}
                alt={foundPersona.name}
              />
              <AvatarFallback>{foundPersona.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold">{foundPersona.name}</h3>
              <p className="text-muted-foreground text-sm">
                {foundPersona.description}
              </p>
            </div>
          </CardContent>
          <CardContent>
            <Button
              onClick={handleCreate}
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? (
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FiCheck className="mr-2 h-4 w-4" />
              )}
              Yes, Create This Bot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
