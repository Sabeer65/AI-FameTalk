import React from "react";
import { Button } from "@/components/ui/button";
import TransitionLink from "@/components/TransitionLink";
import { FiMessageSquare, FiPenTool, FiUserCheck, FiCpu } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// A small component for feature cards to keep the code clean
const FeatureCard = ({ icon, title, description }: any) => (
  <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
    <CardHeader>
      <div className="bg-primary/10 text-primary mb-4 w-fit rounded-lg p-3">
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

export default function HomePage() {
  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="animate-fade-in-up mb-6 text-5xl font-extrabold tracking-tighter md:text-7xl">
          Converse with Legends
        </h1>
        <p className="text-muted-foreground animate-fade-in-up animation-delay-300 mx-auto mb-10 max-w-3xl text-lg md:text-xl">
          Step into a new reality. Create and converse with AI personas of
          celebrities, historical figures, and fictional characters. Your
          imagination is the only limit.
        </p>
        <div className="animate-fade-in-up animation-delay-500 flex items-center justify-center gap-4">
          <TransitionLink href="/personas">
            <Button size="lg" className="px-8 py-6 text-lg">
              Get Started
            </Button>
          </TransitionLink>
          <TransitionLink href="#features">
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
              Learn More
            </Button>
          </TransitionLink>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            A Universe of Conversation
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            AI FameTalk provides a seamless experience for you to connect with
            any personality you can dream of.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<FiUserCheck size={24} />}
            title="Choose a Persona"
            description="Browse our ever-expanding library of famous individuals and characters, ready for you to engage with."
          />
          <FeatureCard
            icon={<FiMessageSquare size={24} />}
            title="Start Chatting"
            description="Dive into deep conversations, ask questions, or just hang out. Each persona has a unique voice and personality."
          />
          <FeatureCard
            icon={<FiPenTool size={24} />}
            title="Create Your Own"
            description="Bring your own characters to life with our powerful custom persona generator, available for premium users."
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <Badge variant="secondary">Powered by Gemini</Badge>
            <h2 className="text-4xl font-bold tracking-tight">
              Realistic and Engaging Dialogue
            </h2>
            <p className="text-muted-foreground text-lg">
              Our application leverages state-of-the-art AI to ensure every
              conversation feels natural and true to the persona's character.
              Experience interactions that are not just intelligent, but also
              emotionally resonant.
            </p>
            <ul className="text-muted-foreground space-y-3">
              <li className="flex items-center gap-2">
                <FiCpu className="text-primary" />
                <span>Context-aware and long-term memory.</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCpu className="text-primary" />
                <span>Unique voice and personality for each character.</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCpu className="text-primary" />
                <span>Powered by Google's Gemini-1.5-Flash model.</span>
              </li>
            </ul>
          </div>
          <div>
            <Card className="bg-card/50 border-primary/20 p-8 backdrop-blur-sm">
              <img
                src="https://placehold.co/1000x800/101018/4f46e5/png?text=Dynamic+AI&font=raleway"
                alt="AI in action"
                className="rounded-lg shadow-2xl"
              />
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight">
          Ready to Start a Conversation?
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
          Join thousands of users exploring the past, present, and the world of
          fiction. Your next great conversation is just a click away.
        </p>
        <TransitionLink href="/personas">
          <Button size="lg" className="px-10 py-7 text-lg">
            Explore the Library
          </Button>
        </TransitionLink>
      </section>
    </div>
  );
}
