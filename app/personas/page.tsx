import React from "react";
import dbConnect from "@/lib/dbConnect";
import Persona from "@/models/Persona";
import PersonaGrid from "@/components/PersonaGrid";

async function getPersonas() {
  await dbConnect();

  const personas = await Persona.find({}).lean();
  return JSON.parse(JSON.stringify(personas));
}

export default async function PersonasPage() {
  const personas = await getPersonas();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Persona Library
        </h1>
        <p className="text-lg text-gray-400">
          Discover, create, and chat with your favorite personalities.
        </p>
      </div>

      <PersonaGrid personas={personas} />
    </div>
  );
}
