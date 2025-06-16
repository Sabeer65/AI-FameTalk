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
  },
];

export default function PricingPage() {
  return (
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
              <Button
                className="w-full"
                variant={tier.variant as "default" | "outline"}
              >
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
