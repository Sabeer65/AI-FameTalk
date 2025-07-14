"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Provider = {
  id: string;
  name: string;
};

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
    null,
  );
  const [email, setEmail] = useState("");

  // This hook will manage the scrollbar
  useEffect(() => {
    // When the component mounts, hide the scrollbar on the body
    document.body.style.overflow = "hidden";

    // When the component unmounts, restore the default overflow
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []); // The empty dependency array ensures this runs only once on mount and cleanup

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();
  }, []);

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    signIn("email", { email, callbackUrl: "/personas" });
  };

  const googleProvider = providers
    ? Object.values(providers).find((p) => p.id === "google")
    : null;

  return (
    <div className="bg-background grid h-screen place-items-center">
      <Card className="mx-4 -mt-20 w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Choose a provider or sign in with your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* --- Google Sign-In Button --- */}
          {googleProvider && (
            <Button
              onClick={() =>
                signIn(googleProvider.id, { callbackUrl: "/personas" })
              }
              variant="outline"
              className="w-full"
            >
              Sign in with {googleProvider.name}
            </Button>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card text-muted-foreground px-2">
                Or continue with
              </span>
            </div>
          </div>

          {/* --- Email Sign-In Form --- */}
          <form onSubmit={handleEmailSignIn}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In with Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
