export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/chat", "/profile", "/personas", "/admin"],
};
