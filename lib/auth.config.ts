import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicRoutes = ["/", "/login", "/register", "/forgot-password"];
      const pathname = nextUrl.pathname;

      if (publicRoutes.includes(pathname)) return true;
      if (!isLoggedIn) return false;

      if (pathname.startsWith("/admin")) {
        const role = auth?.user?.role as UserRole | undefined;
        return role === "ADMIN" || role === "SUPER_ADMIN";
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.organizationId = user.organizationId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.organizationId =
        (token.organizationId as string | null) ?? null;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
