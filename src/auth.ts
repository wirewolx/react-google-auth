import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/prisma";

/**
 * Серверная конфигурация Auth.js.
 * Секреты читаются только на сервере (AUTH_* в .env).
 * Сессия хранится на сервере (DB) + httpOnly cookie с sessionToken.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  callbacks: {
    session({ session, user }) {
      if (session.user && user?.id) session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
