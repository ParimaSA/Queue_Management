import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DJANGO_API_ENDPOINT } from "@/config/defaults";
import { getAuthToken, setRefreshToken, setToken } from "./auth";

const createUserInDjango = async (email: string) => {
  const response = await fetch(`${DJANGO_API_ENDPOINT}/business/email-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  return data;
};


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        console.log(user, token, account);

        // Create the user in Django if the user doesn't exist
        const userData = await createUserInDjango(user.email as string);
        if(!userData.error){
          setToken(userData.access_token)
          setRefreshToken(userData.setRefreshToken)
        }
      }
      return token;
    },
    async session({ session }) {
      console.log(`authtoken: ${getAuthToken()}`)
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/business`;
    },
  },
};
