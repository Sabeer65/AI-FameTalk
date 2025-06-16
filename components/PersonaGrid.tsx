"use client";

import React, { useState, useMemo } from "react";
import TransitionLink from "./TransitionLink";
import { FiSearch, FiMessageSquare, FiPlus, FiPenTool } from "react-icons/fi";
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
          activeCategory === "All" || persona.category === activeCategory,
      )
      .filter((persona) =>
        persona.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
  }, [personas, activeCategory, searchQuery]);

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
        {filteredPersonas.map((persona) => (
          <Card
            key={persona._id}
            className="group hover:border-primary flex flex-col overflow-hidden transition-colors"
          >
            <CardHeader className="p-0">
              <img
                src={persona.imageUrl}
                alt={persona.name}
                className="h-48 w-full object-cover"
              />
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <Badge variant="secondary" className="mb-2">
                {persona.category}
              </Badge>
              <CardTitle className="mb-1 truncate text-xl">
                {persona.name}
              </CardTitle>
              <p className="text-muted-foreground line-clamp-2 text-sm">
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
        <div className="col-span-full py-16 text-center">
          <p className="text-muted-foreground text-lg">No personas found.</p>
        </div>
      )}
    </>
  );
}
