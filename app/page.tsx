import React from "react";
import { Button } from "@/components/ui/button";
import TransitionLink from "@/components/TransitionLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiMessageCircle, FiPlusCircle, FiUsers } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const features = [
  {
    icon: <FiUsers className="text-primary h-10 w-10" />,
    title: "Choose Your Icon",
    description:
      "Select from a library of historical figures, fictional characters, and celebrities, each with a unique personality.",
  },
  {
    icon: <FiMessageCircle className="text-primary h-10 w-10" />,
    title: "Start a Conversation",
    description:
      "Engage in dynamic, insightful, and entertaining chats. Ask anything and explore different perspectives.",
  },
  {
    icon: <FiPlusCircle className="text-primary h-10 w-10" />,
    title: "Create Your Own",
    description:
      "Bring your own characters to life. Design custom personas from scratch with our powerful creation tools.",
  },
];

const featuredPersonas = [
  {
    name: "Cleopatra",
    image: "https://placehold.co/512x512/4a0087/FFFFFF/png?text=C&font=raleway",
    description: "The last pharaoh of Egypt.",
  },
  {
    name: "Albert Einstein",
    image:
      "https://placehold.co/512x512/4a0087/FFFFFF/png?text=AE&font=raleway",
    description: "The father of relativity.",
  },
  {
    name: "Sherlock Holmes",
    image:
      "https://placehold.co/512x512/4a0087/FFFFFF/png?text=SH&font=raleway",
    description: "The world's greatest detective.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-24 py-12 md:py-24">
      <section className="container mx-auto px-4 text-center">
        <h1 className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-5xl font-extrabold tracking-tighter text-transparent md:text-7xl">
          Converse with the Cosmos
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 mb-10 max-w-2xl text-lg md:text-xl">
          Forge and interact with AI personas of icons, legends, and characters
          from across time and fiction. Your imagination is the next frontier.
        </p>
        <div className="flex items-center justify-center gap-4">
          <TransitionLink href="/personas">
            <Button size="lg" className="text-lg">
              Get Started
            </Button>
          </TransitionLink>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tighter">How It Works</h2>
          <p className="text-muted-foreground mt-2">
            Three simple steps to start your journey.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-primary/30 transform text-center transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="items-center">{feature.icon}</CardHeader>
              <CardContent>
                <CardTitle className="mb-2 text-xl">{feature.title}</CardTitle>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tighter">
            Featured Personas
          </h2>
          <p className="text-muted-foreground mt-2">
            Just a few of the minds you can talk to right now.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {featuredPersonas.map((persona) => (
            <div
              key={persona.name}
              className="group relative overflow-hidden rounded-lg"
            >
              <img
                src={persona.image}
                alt={persona.name}
                className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:bg-black/70"></div>
              <div className="absolute bottom-0 p-6">
                <h3 className="text-2xl font-bold text-white">
                  {persona.name}
                </h3>
                <p className="text-white/80">{persona.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
