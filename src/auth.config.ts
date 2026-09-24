import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth: session, request }) {
      const isProtected =
        request.nextUrl.pathname.startsWith("/raffles") ||
        request.nextUrl.pathname.startsWith("/api/raffles");
      return isProtected ? Boolean(session?.user) : true;
    },
  },
} satisfies NextAuthConfig;
