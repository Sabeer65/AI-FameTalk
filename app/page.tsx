"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import TransitionLink from "@/components/TransitionLink";
import {
  FiMessageSquare,
  FiPenTool,
  FiUsers,
  FiCpu,
  FiStar,
  FiChevronRight,
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(ScrollTrigger);

// A small component for feature cards to keep the code clean
const FeatureCard = ({ icon, title, description }: any) => (
  <Card className="feature-card bg-card/50 border-border/50 hover:border-primary/30 hover:shadow-primary/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
    <CardHeader className="p-6">
      <div className="bg-primary/10 text-primary mb-4 w-fit rounded-lg p-3">
        {icon}
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="pt-2">{description}</CardDescription>
    </CardHeader>
  </Card>
);

const PersonaShowcaseCard = ({
  name,
  description,
  imageUrl,
}: {
  name: string;
  description: string;
  imageUrl: string;
}) => (
  // THE FIX: Added h-96 to set a fixed height for the card.
  <Card className="persona-showcase-card group relative h-96 overflow-hidden rounded-xl">
    <img
      src={imageUrl}
      alt={name}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    <CardContent className="relative flex h-full flex-col justify-end p-6">
      <h3 className="text-2xl font-bold text-white">{name}</h3>
      <p className="line-clamp-2 text-sm text-white/80">{description}</p>
    </CardContent>
  </Card>
);
export default function HomePage() {
  const container = useRef(null);

  useGSAP(
    () => {
      // Hero Section Animation
      gsap.timeline().from(".hero-element", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.2,
      });

      // Persona Showcase Animation
      gsap.from(".persona-showcase-card", {
        scrollTrigger: {
          trigger: "#persona-showcase",
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      // Features Section Animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: "#features",
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      // Dialogue Section Animation
      const dialogueTrigger = "#dialogue-section";
      gsap.from(`${dialogueTrigger} .dialogue-content`, {
        scrollTrigger: {
          trigger: dialogueTrigger,
          start: "top 75%",
        },
        opacity: 0,
        x: -50,
        duration: 1,
        ease: "power3.out",
      });
      gsap.from(`${dialogueTrigger} .dialogue-image`, {
        scrollTrigger: {
          trigger: dialogueTrigger,
          start: "top 75%",
        },
        opacity: 0,
        x: 50,
        duration: 1,
        ease: "power3.out",
      });

      // CTA Section Animation
      gsap.from("#cta-section > *", {
        scrollTrigger: {
          trigger: "#cta-section",
          start: "top 85%",
        },
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} className="space-y-28 md:space-y-36">
      {/* Hero Section */}
      <section className="container mx-auto flex min-h-[85vh] flex-col items-center justify-center px-4 py-24 text-center">
        <Badge variant="secondary" className="hero-element mb-6"></Badge>
        <h1 className="hero-element text-5xl font-extrabold tracking-tighter md:text-7xl lg:text-8xl">
          Converse with Legends
        </h1>
        <p className="hero-element text-muted-foreground mx-auto mt-6 mb-10 max-w-3xl text-lg md:text-xl">
          Step into a new reality. Create and converse with AI personas of
          celebrities, historical figures, and fictional characters. Your
          imagination is the only limit.
        </p>
        <div className="hero-element flex flex-col items-center justify-center gap-4 sm:flex-row">
          <TransitionLink href="/personas">
            <Button
              size="lg"
              className="shadow-primary/20 px-8 py-7 text-lg shadow-lg"
            >
              Explore Personas <FiChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </TransitionLink>
          <TransitionLink href="#features">
            <Button size="lg" variant="outline" className="px-8 py-7 text-lg">
              Learn More
            </Button>
          </TransitionLink>
        </div>
      </section>

      {/* Featured Personas Section */}
      <section id="persona-showcase" className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
          <PersonaShowcaseCard
            name="Albert Einstein"
            description="Physicist who developed the theory of relativity."
            imageUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/800px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg"
          />
          <PersonaShowcaseCard
            name="Cleopatra"
            description="The last active ruler of the Ptolemaic Kingdom of Egypt."
            imageUrl="https://www.worldhistory.org/img/r/p/500x600/14929.jpg?v=1731444006"
          />
          <PersonaShowcaseCard
            name="Sherlock Holmes"
            description="A fictional detective of the late 19th and early 20th centuries."
            imageUrl="https://cdn.squaremile.com/gallery_landscape_widescreen/625438224235e.webp"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            A Universe of Conversation
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            AI FameTalk provides a seamless experience for you to connect with
            any personality you can dream of.
          </p>
          <img src="logo.png" alt="" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<FiUsers size={24} />}
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
      <section id="dialogue-section" className="container mx-auto px-4 py-16">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="dialogue-content space-y-6">
            <Badge variant="secondary">Powered by Gemini</Badge>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Realistic and Engaging Dialogue
            </h2>
            <p className="text-muted-foreground text-lg">
              Our application leverages state-of-the-art AI to ensure every
              conversation feels natural and true to the persona's character.
              Experience interactions that are not just intelligent, but also
              emotionally resonant.
            </p>
            <ul className="text-muted-foreground space-y-4">
              <li className="flex items-start gap-3">
                <FiCpu className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">
                    Context-Aware Memory:
                  </strong>{" "}
                  Resumes conversations naturally, remembering past
                  interactions.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCpu className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">
                    Unique Personalities:
                  </strong>{" "}
                  Each character has a distinct voice, knowledge base, and style
                  of speaking.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <FiCpu className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                <span>
                  <strong className="text-foreground">
                    Advanced AI Model:
                  </strong>{" "}
                  Powered by Google's Gemini 1.5 Flash for speed and
                  intelligence.
                </span>
              </li>
            </ul>
          </div>
          <div className="dialogue-image border-primary/20 bg-card/30 shadow-primary/10 relative rounded-2xl border p-4 shadow-2xl">
            <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-2xl"></div>
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-3xl font-bold text-white">
              "To be, or not to be, that is the question."
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        id="cta-section"
        className="container mx-auto px-4 py-24 text-center"
      >
        <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Ready to Start a Conversation?
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
          Join thousands of users exploring the past, present, and the world of
          fiction. Your next great conversation is just a click away.
        </p>
        <TransitionLink href="/personas">
          <Button
            size="lg"
            className="shadow-primary/20 px-10 py-7 text-lg shadow-lg"
          >
            Explore the Library
          </Button>
        </TransitionLink>
      </section>
    </div>
  );
}
