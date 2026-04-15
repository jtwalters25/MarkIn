import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "read:user user:email repo" },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        // @ts-expect-error GitHub profile fields
        token.githubId = String(profile.id ?? "");
        // @ts-expect-error GitHub profile fields
        token.githubLogin = profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-expect-error attach extras to session
      session.accessToken = token.accessToken;
      // @ts-expect-error attach extras to session
      session.githubId = token.githubId;
      // @ts-expect-error attach extras to session
      session.githubLogin = token.githubLogin;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
