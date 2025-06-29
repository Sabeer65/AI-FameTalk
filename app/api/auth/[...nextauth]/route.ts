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
            html: `...`, // Email HTML is the same
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
    // This callback is called when a JWT is created (i.e., on sign in).
    async jwt({ token, user }) {
      // On initial sign-in, the `user` object is available.
      // We are adding the user's ID and role from the database to the token.
      if (user) {
        token.id = user.id;
        token.role = user.role as string;
      }
      return token;
    },
    // This callback is called whenever a session is checked.
    async session({ session, token }) {
      // We are taking the id and role from the token and adding it to the session.
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/verify-request",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
