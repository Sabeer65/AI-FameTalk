import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import TransitionProvider from "@/components/TransitionProvider";
import TransitionLink from "@/components/TransitionLink";
import "./globals.css";
import { Button } from "@/components/ui/button";
import LoginButton from "@/components/LoginButton"; // Import the new component

const inter = Inter({ subsets: ["latin"] });

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
        </head>
        <body className={`${inter.className} bg-background text-foreground`}>
          <TransitionProvider>
            <header className="bg-background sticky top-0 z-20 border-b">
              <nav className="container mx-auto flex items-center justify-between p-4">
                <TransitionLink href="/" className="text-xl font-bold">
                  AI FameTalk
                </TransitionLink>
                <div className="hidden items-center space-x-2 md:flex">
                  <TransitionLink href="/personas">
                    <Button variant="ghost">Personas</Button>
                  </TransitionLink>
                  <TransitionLink href="/chat">
                    <Button variant="ghost">Chat</Button>
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
        </body>
      </html>
    </AuthProvider>
  );
}
