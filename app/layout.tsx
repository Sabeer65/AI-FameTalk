"use client";

import AuthProvider from "@/components/AuthProvider";
import TransitionProvider from "@/components/TransitionProvider";
import TransitionLink from "@/components/TransitionLink";
import "./globals.css";
import { Button } from "@/components/ui/button";
import LoginButton from "@/components/LoginButton";
import { Toaster } from "@/components/ui/sonner";
import VoiceProvider from "@/components/VoiceProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" className="dark">
        <head>
          <title>AI FameTalk</title>
          <meta name="description" content="Chat with your favorite personas" />
          {/* THE FIX: Replace the old font link with these new ones */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&family=Public+Sans:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <VoiceProvider>
            <TransitionProvider>
              <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur-sm">
                <nav className="container mx-auto flex items-center justify-between p-4">
                  <TransitionLink
                    href="/"
                    className="text-xl font-bold tracking-tighter"
                  >
                    AI FameTalk
                  </TransitionLink>
                  <div className="hidden items-center space-x-2 md:flex">
                    <TransitionLink href="/personas">
                      <Button variant="ghost">Personas</Button>
                    </TransitionLink>
                    <TransitionLink href="/chat">
                      <Button variant="ghost">Chat</Button>
                    </TransitionLink>
                    <TransitionLink href="/pricing">
                      <Button variant="ghost">Pricing</Button>
                    </TransitionLink>
                    <TransitionLink href="/profile">
                      <Button variant="ghost">Profile</Button>
                    </TransitionLink>
                  </div>
                  <LoginButton />
                </nav>
              </header>
              <main className="container mx-auto p-4 md:p-6">{children}</main>
            </TransitionProvider>
          </VoiceProvider>
          <Toaster theme="dark" position="bottom-right" />
        </body>
      </html>
    </AuthProvider>
  );
}
