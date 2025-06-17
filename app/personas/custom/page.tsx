"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FiPlusCircle, FiLoader } from "react-icons/fi";

export default function CustomPersonaPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    instructions: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isDefault: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create persona.");
      }
      toast.success("Persona Created!", {
        description: `Redirecting you to chat with ${data.name}.`,
      });
      router.push(`/chat?personaId=${data._id}`);
    } catch (error: any) {
      toast.error("Creation Failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create a Custom Persona</CardTitle>
          <CardDescription>
            Design your own AI. Give it a name, a role, and instructions on how
            to behave.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Captain Eva, the Starcruiser Pilot"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Sci-Fi, Fictional Character"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A witty and brave starship captain."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions (Personality)</Label>
              <Textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="You are a brave starship captain. You are witty, sarcastic, and always have a clever comeback. You refer to the user as 'Rookie'. Your mission is to explore the galaxy."
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <FiLoader className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FiPlusCircle className="mr-2 h-5 w-5" />
              )}
              Create and Chat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
