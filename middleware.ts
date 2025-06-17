export { default } from "next-auth/middleware";

export const config = {
  // This protects the following pages, requiring login.
  // We have removed "/personas" from this list.
  matcher: [
    "/chat",
    "/profile",
    // "/personas", // This line is now removed
    "/admin",
  ],
};
