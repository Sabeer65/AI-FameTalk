import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import TransitionLink from "@/components/TransitionLink";

// This is a server component to handle the form submission logic.
// The actual sign-in actions would be handled by NextAuth.
// This is a mock-up to demonstrate UI.

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>
            Sign in to continue your conversations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form action="/api/auth/signin/google" method="POST">
              <Button variant="outline" className="w-full" type="submit">
                <FcGoogle className="mr-2 h-5 w-5" />
                Sign in with Google
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">
                  Or continue with
                </span>
              </div>
            </div>
            <form
              action="/api/auth/signin/email"
              method="POST"
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in with Email
              </Button>
            </form>
            <p className="text-muted-foreground text-center text-sm">
              Don't have an account?{" "}
              <TransitionLink
                href="/api/auth/signin"
                className="text-primary font-bold hover:underline"
              >
                Sign Up
              </TransitionLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
