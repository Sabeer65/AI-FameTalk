"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiCheckCircle, FiZap, FiStar } from "react-icons/fi";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "For casual users to get a taste of AI conversations.",
    features: [
      "5 daily message credits",
      "Access to all standard personas",
      "Basic conversation memory",
    ],
    cta: "Start for Free",
    isFeatured: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "For enthusiasts who want the full, unrestricted experience.",
    features: [
      "Unlimited message credits",
      "Create custom AI personas",
      "Enhanced conversation memory",
      "Priority access to new features",
    ],
    cta: "Go Pro",
    isFeatured: true,
  },
];

const FeatureListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-center gap-3">
    <FiCheckCircle className="text-primary h-5 w-5" />
    <span className="text-muted-foreground">{children}</span>
  </li>
);

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeClick = async () => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (session?.user.isPro) {
      toast.info("You are already a Pro user.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/create-subscription", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to create subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tighter md:text-6xl">
          Unlock Your Potential
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg md:text-xl">
          Choose the plan that's right for you and start having limitless
          conversations today.
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              "bg-card/50 border-border/50 flex h-full flex-col backdrop-blur-sm transition-all duration-300",
              tier.isFeatured
                ? "border-primary/50 ring-primary/50 shadow-primary/10 shadow-2xl ring-2"
                : "",
            )}
          >
            <CardHeader className="p-8">
              {tier.isFeatured && (
                <div className="bg-primary text-primary-foreground mb-4 flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                  <FiStar />
                  Most Popular
                </div>
              )}
              <CardTitle className="text-4xl font-bold">{tier.name}</CardTitle>
              <CardDescription className="text-muted-foreground pt-2 text-lg">
                {tier.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-8">
              <div className="mb-8">
                <span className="text-5xl font-extrabold">{tier.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-4">
                {tier.features.map((feature, index) => (
                  <FeatureListItem key={index}>{feature}</FeatureListItem>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8">
              <Button
                size="lg"
                className="w-full py-6 text-lg"
                variant={tier.isFeatured ? "default" : "outline"}
                onClick={handleUpgradeClick}
                disabled={isLoading || (session?.user.isPro && tier.isFeatured)}
              >
                {isLoading && tier.isFeatured ? "Processing..." : tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
