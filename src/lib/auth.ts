import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const nextauthSecret = process.env.NEXTAUTH_SECRET;

if (!clientId || !clientSecret) {
  console.warn(
    "[markin/auth] GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing. " +
      "Sign-in will fail until both are set in .env."
  );
}
if (!nextauthSecret) {
  console.warn(
    "[markin/auth] NEXTAUTH_SECRET is missing. JWT signing will fail. " +
      "Generate one with: openssl rand -base64 32"
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GitHubProvider({
      clientId: clientId ?? "",
      clientSecret: clientSecret ?? "",
      authorization: {
        params: { scope: "read:user user:email repo" },
      },
    }),
  ],
  secret: nextauthSecret,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, user }) {
      // First sign-in: persist GitHub access token + user id into the JWT.
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-expect-error attach extras to session
      session.accessToken = token.accessToken;
      if (session.user) {
        // @ts-expect-error expose user id on session.user
        session.user.id = token.userId ?? token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  debug: process.env.NODE_ENV !== "production",
};
