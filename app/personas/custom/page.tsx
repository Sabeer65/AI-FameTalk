"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FiSave } from "react-icons/fi";
import { toast } from "sonner";

export default function CustomPersonaPage() {
  const [formData, setFormData] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // API logic to save the custom persona will go here
    toast.info("This feature will be enabled in the next step!");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create a Custom Persona
        </h1>
        <p className="text-muted-foreground">
          Design a unique AI personality from scratch. Let your imagination run
          wild.
        </p>
      </div>

      <form onSubmit={handleCreate}>
        <Card>
          <CardHeader>
            <CardTitle>Persona Details</CardTitle>
            <CardDescription>
              Define all the properties of your persona for a completely custom
              bot.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                onChange={handleInputChange}
                placeholder="e.g., Fictional, Assistant"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                name="description"
                onChange={handleInputChange}
                placeholder="A brief, one-sentence description."
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="systemPrompt">Personality (System Prompt)</Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                onChange={handleInputChange}
                className="min-h-[150px]"
                placeholder="Describe the persona's personality, speaking style, knowledge, and how they should behave..."
                required
              />
            </div>
          </CardContent>
          <CardContent>
            <Button type="submit" className="w-full" disabled={isCreating}>
              <FiSave className="mr-2 h-4 w-4" />
              Save Custom Persona
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
