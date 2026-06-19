import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middlewareAuth } = NextAuth(authConfig);

export default middlewareAuth((req) => {
  const { pathname } = req.nextUrl;
  const publicRoutes = ["/", "/login", "/register", "/forgot-password"];
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isLoggedIn = !!req.auth;

  if (publicRoutes.includes(pathname) && !authRoutes.includes(pathname)) {
    return;
  }

  if (authRoutes.includes(pathname) && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
