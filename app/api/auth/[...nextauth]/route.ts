import NextAuth, { DefaultSession } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

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
              <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                <h2>Welcome to AI FameTalk</h2>
                <p>Click the button below to sign in securely.</p>
                <a href="${url}" target="_blank" style="background-color: #4a0087; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Sign In
                </a>
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
    strategy: "jwt", // Use JSON Web Tokens for session management
  },
  callbacks: {
    // THIS IS THE FIX: This callback runs whenever a session is checked.
    // We are taking the `id` from the token (which NextAuth handles)
    // and adding it to the `session.user` object.
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string; // `token.sub` is the user's ID
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
