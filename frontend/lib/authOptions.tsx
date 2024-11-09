import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { setToken } from "./auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
        if (account?.provider === "google") {
            token.accessToken = account.access_token;
            token.email = profile?.email;
            token.idToken = account.id_token;
            token.refreshToken = account.refresh_token || token.refreshToken;
            token.accessTokenExpires = Date.now() + 3600 * 1000;
            console.log("Token expires at: " + new Date(token.accessTokenExpires).toLocaleString())
        }

        if (Date.now() < token.accessTokenExpires) {
            return token;
        }

        console.log("Access token has expired, refreshing...");
        return await refreshAccessToken(token);
    },
    async session({ session, token }) {
        session.email = token.email;
        session.idToken = token.idToken;
        session.accessToken = token.accessToken;

        return session;
    },
},
};