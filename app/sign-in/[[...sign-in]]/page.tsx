"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaGoogle } from "react-icons/fa";

export default function SignInPage() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    // This triggers the EmailProvider flow
    await signIn("email", { email, callbackUrl: "/" });
  };

  return (
    <div className="flex items-center justify-center py-20">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in or create an account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* This triggers the GoogleProvider flow */}
          <Button
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <FaGoogle className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">
                Or continue with email
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
            />
            <Button type="submit" className="w-full">
              Sign in with Email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
