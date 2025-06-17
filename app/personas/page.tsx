import { cache } from "react";
import dbConnect from "@/lib/dbConnect";
import Persona from "@/models/Persona";
import PersonaGrid from "@/components/PersonaGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

const getPersonas = cache(async (userId: string | undefined) => {
  await dbConnect();

  const query = userId
    ? { $or: [{ isDefault: true }, { creatorId: userId }] }
    : { isDefault: true };

  const personas = await Persona.find(query)
    .select("name description imageUrl category isDefault creatorId") // Add isDefault and creatorId
    .sort({ name: 1 })
    .lean();

  return JSON.parse(JSON.stringify(personas));
});

export default async function PersonasPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const personas = await getPersonas(userId);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Persona Library
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover, create, and chat with your favorite personalities.
        </p>
      </div>
      {/* We now pass the session info to the grid component */}
      <PersonaGrid
        initialPersonas={personas}
        session={{ user: { id: userId, role: userRole } }}
      />
    </div>
  );
}
