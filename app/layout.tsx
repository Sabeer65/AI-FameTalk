"use client"; // Required for TransitionProvider to work with its children

import { Inter } from "next/font/google";
import TransitionProvider from "@/components/TransitionProvider";
import TransitionLink from "@/components/TransitionLink";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>AI FameTalk</title>
        <meta name="description" content="Chat with your favorite personas" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <TransitionProvider>
          <header className="border-b border-gray-700 bg-gray-900 relative z-10">
            <nav className="container mx-auto flex justify-between items-center p-4">
              <TransitionLink
                href="/"
                className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                AI FameTalk
              </TransitionLink>
              <div className="flex items-center space-x-6">
                <TransitionLink
                  href="/personas"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Personas
                </TransitionLink>
                <TransitionLink
                  href="/chat"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Chat
                </TransitionLink>
                <TransitionLink
                  href="/profile"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Profile
                </TransitionLink>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  Sign In
                </button>
              </div>
            </nav>
          </header>
          <main>{children}</main>
        </TransitionProvider>
      </body>
    </html>
  );
}
