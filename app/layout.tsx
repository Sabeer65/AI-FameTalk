import { Space_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import TransitionProvider from "@/components/TransitionProvider";
import TransitionLink from "@/components/TransitionLink";
import "./globals.css";
import { Button } from "@/components/ui/button";
import LoginButton from "@/components/LoginButton";
import { Toaster } from "@/components/ui/sonner";
import VoiceProvider from "@/components/VoiceProvider";
import { cn } from "@/lib/utils";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <title>AI FameTalk</title>
          <meta
            name="description"
            content="Chat with your favorite AI personas"
          />
        </head>
        <body className={cn("font-sans antialiased", spaceMono.variable)}>
          <VoiceProvider>
            <TransitionProvider>
              <header className="bg-background/80 sticky top-0 z-50 border-b border-white/10 backdrop-blur-sm">
                <nav className="container mx-auto flex items-center justify-between p-4">
                  <TransitionLink
                    href="/"
                    className="text-2xl font-bold tracking-tighter"
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
