import Api from "@/axios.config";
import { AUTH_CHECK, AUTH_SESSION } from "@/constants/endpoints";
import NextAuth from "next-auth";
import Email from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

const scopes = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: scopes.join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async signIn(data) {
      try {
        const { user, account, profile } = data;
        await Api.post(AUTH_SESSION, {
          userId: user.id,
          email: user.email,
          accessToken: account?.access_token,
          expiryDate: account?.expires_at,
          idToken: account?.id_token,
          refreshToken: account?.refresh_token,
          refreshTokenExpiresIn: account?.refresh_token_expires_in || 0,
          scope: account?.scope,
          tokenType: account?.token_type,
        });

        return true;
      } catch (e) {
        console.log("Error in signIn", e);
        return false;
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as any;
      session.expires = token.expiresAt as any;
      session.user.image = token.picture;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.expiresAt = account.expires_at;
      }

      if (user) {
        const res = await Api.getWithParams(AUTH_CHECK, {
          email: user.email,
        });
        if (res.status == 200) {
          token.accessToken = res.data.jwt_accessToken;
        }
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST };
