import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiCheckCircle, FiStar, FiZap } from "react-icons/fi";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import TransitionLink from "@/components/TransitionLink";

const tiers = [
  {
    name: "Free",
    price: "$0",
    features: [
      "50 Messages per Day",
      "Access to Default Personas",
      "Standard Chat Speed",
      "Community Access",
    ],
    icon: <FiZap className="text-muted-foreground h-8 w-8" />,
    buttonText: "Currently Active",
    buttonVariant: "outline",
  },
  {
    name: "Premium",
    price: "$9.99",
    features: [
      "Unlimited Messages",
      "Access All Personas",
      "Create Custom Personas",
      "Faster Response Times",
      "Priority Support",
    ],
    icon: <FiStar className="text-primary h-8 w-8" />,
    buttonText: "Upgrade to Premium",
    buttonVariant: "default",
    recommended: true,
  },
];

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const userTier = session?.user?.tier || "Free";

  return (
    <div className="flex flex-col items-center py-12">
      <h1 className="text-5xl font-extrabold tracking-tighter">
        Choose Your Plan
      </h1>
      <p className="text-muted-foreground mt-4 mb-12 max-w-xl text-center text-lg">
        Unlock the full potential of AI conversations with a plan that fits your
        needs.
      </p>
      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={`flex flex-col ${
              tier.recommended ? "border-primary shadow-primary/30" : ""
            }`}
          >
            <CardHeader className="items-center text-center">
              {tier.icon}
              <CardTitle className="text-3xl">{tier.name}</CardTitle>
              <p className="text-4xl font-bold">
                {tier.price}
                <span className="text-muted-foreground text-base font-normal">
                  / month
                </span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col">
              <ul className="mb-8 flex-grow space-y-4">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <FiCheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.name.toLowerCase() === userTier.toLowerCase() ? (
                <Button disabled variant="outline" className="mt-auto w-full">
                  Currently Active
                </Button>
              ) : (
                <TransitionLink
                  href={tier.name === "Premium" ? "/api/billing/upgrade" : "#"}
                  className="mt-auto w-full"
                >
                  <Button
                    className="w-full"
                    variant={tier.buttonVariant as "default" | "outline"}
                  >
                    {tier.buttonText}
                  </Button>
                </TransitionLink>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
