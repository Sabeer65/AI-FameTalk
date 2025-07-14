"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import TransitionProvider from "@/components/TransitionProvider";
import TransitionLink from "@/components/TransitionLink";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/LoginButton";
import { Toaster } from "@/components/ui/sonner";
import VoiceProvider from "@/components/VoiceProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      {/* THE FIX: Add suppressHydrationWarning to the <html> tag */}
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>AI FameTalk</title>
          <meta name="description" content="Chat with your favorite personas" />
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
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <VoiceProvider>
              <TransitionProvider>
                <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
                  <nav className="container mx-auto flex items-center justify-between p-4">
                    <TransitionLink
                      href="/"
                      className="text-xl font-bold tracking-tighter"
                    >
                      <img src="logo.png" alt="" className="h-10" />
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
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <LoginButton />
                    </div>
                  </nav>
                </header>
                <main className="container mx-auto p-4 md:p-6">{children}</main>
              </TransitionProvider>
            </VoiceProvider>
            <Toaster theme="dark" position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
