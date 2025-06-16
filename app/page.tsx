import React from "react";
// Import the new Button component from its location in the ui folder
import { Button } from "@/components/ui/button";
import TransitionLink from "@/components/TransitionLink";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
        Chat with History's Greatest Minds
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Create and converse with AI personas of celebrities, historical figures,
        and fictional characters. Your imagination is the only limit.
      </p>
      <div className="flex justify-center items-center gap-4">
        {/*
          Look how much cleaner this is!
          We're also wrapping them in our TransitionLink to keep the animation.
        */}
        <TransitionLink href="/personas">
          <Button size="lg" className="text-lg">
            Get Started
          </Button>
        </TransitionLink>

        <TransitionLink href="/personas">
          <Button size="lg" variant="secondary" className="text-lg">
            Explore Personas
          </Button>
        </TransitionLink>
      </div>
    </div>
  );
}
