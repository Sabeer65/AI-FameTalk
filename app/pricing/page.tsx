// This is the full code for the file: app/pricing/page.tsx
// It replaces the entire existing content of this file.

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";
import TransitionLink from "@/components/TransitionLink";
import { useRouter } from "next/navigation";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    features: [
      "100 messages per month",
      "Access to all standard personas",
      "Basic support",
    ],
    cta: "You are on this plan",
  },
  {
    name: "Pro",
    price: "₹1000",
    features: [
      "Unlimited messages",
      "Create custom personas",
      "Access to premium personas",
      "Priority support",
    ],
    cta: "Go Pro",
    planId: process.env.NEXT_PUBLIC_RAZORPAY_PRO_PLAN_ID,
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async (planId: string | undefined) => {
    // --- THE FIX: Check user's current subscription tier first ---
    if (session?.user?.subscriptionTier === "pro") {
      toast.info("You are already a Pro member!");
      return;
    }

    if (status !== "authenticated") {
      toast.error("Please sign in to upgrade your plan.");
      return;
    }

    if (!planId) {
      toast.error(
        "Pro plan is not configured correctly. Please contact support.",
      );
      console.error(
        "Razorpay Pro Plan ID is not set in environment variables.",
      );
      return;
    }

    setIsUpgrading(true);
    toast.info("Upgrading you to Pro...");

    try {
      const response = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription.");
      }

      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        toast.success("Success! Your plan is now Pro.", {
          description: "Please complete the payment in the new tab.",
        });
        setTimeout(() => {
          router.push("/personas");
        }, 1000);
      } else {
        throw new Error("Could not retrieve checkout URL.");
      }
    } catch (error: any) {
      toast.error("Upgrade Failed", {
        description: error.message,
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="text-muted-foreground mt-2">
          Choose the plan that's right for you.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.name === "Pro" ? "border-primary" : ""}
          >
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription className="text-4xl font-bold">
                {tier.price}
                <span className="text-sm font-normal">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="text-primary h-5 w-5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.name === "Pro" ? (
                <Button
                  onClick={() => handleUpgrade(tier.planId)}
                  disabled={
                    isUpgrading || session?.user?.subscriptionTier === "pro"
                  }
                  className="w-full"
                >
                  {session?.user?.subscriptionTier === "pro"
                    ? "You are a Pro"
                    : isUpgrading
                      ? "Processing..."
                      : tier.cta}
                </Button>
              ) : (
                <Button disabled className="w-full" variant="outline">
                  {tier.cta}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Already a Pro member? View your{" "}
          <TransitionLink href="/profile">profile</TransitionLink>.
        </p>
      </div>
    </div>
  );
}
