export { default } from "next-auth/middleware";

export const config = {
  // Protect these specific routes, leaving /personas public
  matcher: [
    "/profile/:path*",
    "/chat/:path*",
    "/admin/:path*",
    "/personas/create",
    "/personas/lookup", // Protects the "Find Persona" route
    "/personas/custom",
  ],
};
