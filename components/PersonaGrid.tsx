"use client";

import React, { useState, useMemo } from "react";
import TransitionLink from "./TransitionLink";
import { FiSearch, FiMessageSquare } from "react-icons/fi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // We'll add this next

interface Persona {
  _id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

interface PersonaGridProps {
  personas: Persona[];
}

export default function PersonaGrid({ personas }: PersonaGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    if (!personas) return ["All"];
    return ["All", ...new Set(personas.map((p) => p.category))];
  }, [personas]);

  const filteredPersonas = useMemo(() => {
    if (!personas) return [];
    return personas
      .filter(
        (persona) =>
          activeCategory === "All" || persona.category === activeCategory
      )
      .filter((persona) =>
        persona.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [personas, activeCategory, searchQuery]);

  return (
    <>
      {/* Search and Create Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a persona..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>Create Persona</Button>
        <Button variant="secondary">Create Custom Bot</Button>
      </div>

      {/* Category Filters */}
      <div className="flex justify-center flex-wrap gap-2 mb-12">
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

      {/* Persona Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPersonas.map((persona) => (
          <Card
            key={persona._id}
            className="overflow-hidden flex flex-col group hover:border-primary transition-colors"
          >
            <CardHeader className="p-0">
              <img
                src={persona.imageUrl}
                alt={persona.name}
                className="w-full h-48 object-cover"
              />
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <Badge variant="secondary" className="mb-2">
                {persona.category}
              </Badge>
              <CardTitle className="text-xl mb-1 truncate">
                {persona.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
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
        ))}
      </div>
      {filteredPersonas.length === 0 && (
        <div className="text-center col-span-full py-16">
          <p className="text-muted-foreground text-lg">No personas found.</p>
        </div>
      )}
    </>
  );
}
