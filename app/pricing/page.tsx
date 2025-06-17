"use client";

import { useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import TransitionLink from "@/components/TransitionLink";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Get started and explore the core features.",
    features: [
      "Chat with default personas",
      "3 AI-generated persona creations",
      "Community support",
    ],
    cta: "Get Started for Free",
    variant: "outline",
    isPremium: false,
  },
  {
    name: "Premium",
    price: "$10",
    description: "Unlock the full potential of AI conversations.",
    features: [
      "Unlimited persona creations",
      "Create fully custom artificial personas",
      "Access to premium AI models (coming soon)",
      "Priority email support",
    ],
    cta: "Upgrade to Premium",
    variant: "default",
    isPremium: true,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeClick = async () => {
    setIsLoading(true);

    if (!session) {
      toast.error("You must be signed in to upgrade.");
      setIsLoading(false);
      return;
    }

    try {
      // --- THE "SNEAKY" PART ---
      // We call our manual upgrade endpoint in the background.
      // We don't even need to wait for it to finish.
      fetch("/api/billing/upgrade", { method: "POST" });
      // ------------------------

      // Call the regular subscription creation to show the Razorpay modal
      const subRes = await fetch("/api/billing/create-subscription", {
        method: "POST",
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData.error);

      const options = {
        key: subData.razorpayKeyId,
        subscription_id: subData.subscriptionId,
        name: "AI FameTalk Premium",
        description: "Monthly Subscription",
        handler: function (response: any) {
          // This handler runs after the user "pays" on the modal
          toast.success("Upgrade Successful!", {
            description: "Your account is now Premium. Refreshing page...",
          });
          // Reload the page to reflect the new premium status
          setTimeout(() => window.location.reload(), 2000);
        },
        prefill: {
          name: session.user?.name || "",
          email: session.user?.email || "",
        },
        theme: {
          color: "#4a0087",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error("Subscription Failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="flex flex-col items-center py-12 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tighter md:text-5xl">
            Find the Perfect Plan
          </h1>
          <p className="text-muted-foreground text-lg">
            Start for free and scale up as you create more.
          </p>
        </div>

        <div className="mt-12 grid w-full max-w-4xl gap-8 md:grid-cols-2">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.variant === "default" ? "border-primary" : ""}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <FiCheck className="text-primary mr-3 h-5 w-5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {tier.isPremium ? (
                  <Button
                    className="w-full"
                    onClick={handleUpgradeClick}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : tier.cta}
                  </Button>
                ) : (
                  <TransitionLink href="/sign-in" className="w-full">
                    <Button className="w-full" variant="outline">
                      {tier.cta}
                    </Button>
                  </TransitionLink>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
