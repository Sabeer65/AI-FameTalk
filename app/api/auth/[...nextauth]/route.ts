// This is the full code for the file: app/api/auth/[...nextauth]/route.ts
// It replaces the entire existing content of this file.

import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import User from "@/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: import("next-auth").NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      from: "no-reply@yourdomain.com",
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          await resend.emails.send({
            from: "AI FameTalk <onboarding@resend.dev>",
            to: [email],
            subject: "Sign in to AI FameTalk",
            html: `
              <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
                <h2 style="color: #333;">Sign In to Your Account</h2>
                <p style="color: #555; margin-bottom: 30px;">Click the button below to sign in to AI FameTalk securely.</p>
                <a href="${url}" target="_blank" style="background-color: #6a0dad; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Sign In</a>
                <p style="color: #888; font-size: 12px; margin-top: 30px;">If you did not request this email, you can safely ignore it.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Could not send verification email.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
