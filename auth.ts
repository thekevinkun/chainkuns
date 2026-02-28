// ============================================
// auth.ts — NextAuth v5 Configuration
// This is the main auth config for the entire app
// Handles SIWE (Sign In With Ethereum) login flow
// ============================================

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { createClient } from "@/lib/supabase/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // We use JWT strategy — session stored in a cookie, not a database
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      // This provider handles SIWE login
      name: "Ethereum",

      credentials: {
        message: { label: "Message", type: "text" }, // the SIWE message user signed
        signature: { label: "Signature", type: "text" }, // the signature from MetaMask
      },

      async authorize(credentials) {
        try {
          // Parse the SIWE message from the credentials
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message as string),
          );

          // Verify the signature is valid
          // This proves the user actually owns the wallet
          const result = await siwe.verify({
            signature: credentials?.signature as string,
          });

          if (!result.success) {
            // Signature is invalid — reject login
            return null;
          }

          // Signature is valid — get the wallet address
          const walletAddress = siwe.address;

          // Connect to Supabase to find or create the user
          const supabase = await createClient();

          // Check if this wallet already has an account
          const { data: existingUser } = await supabase
            .from("users")
            .select("id, wallet_address")
            .eq("wallet_address", walletAddress.toLowerCase())
            .single();

          if (existingUser) {
            // User already exists — return their info
            return {
              id: existingUser.id,
              name: existingUser.wallet_address, // we use wallet as "name"
            };
          }

          // First time login — create a new user record
          const { data: newUser, error } = await supabase
            .from("users")
            .insert({ wallet_address: walletAddress.toLowerCase() })
            .select("id, wallet_address")
            .single();

          if (error || !newUser) {
            // Failed to create user
            return null;
          }

          // Return the new user's info
          return {
            id: newUser.id,
            name: newUser.wallet_address,
          };
        } catch (error) {
          // Something went wrong — reject login
          console.error("SIWE auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // jwt callback — runs when JWT token is created or updated
    async jwt({ token, user }) {
      if (user) {
        // First login — add user info to the token
        token.id = user.id; // Supabase user ID
        token.address = user.name; // wallet address
      }
      return token;
    },

    // session callback — runs when session is checked
    async session({ session, token }) {
      if (token) {
        // Add the wallet address and user ID to the session
        // This is what components can access via useSession()
        session.user.id = token.id as string;
        session.user.address = token.address as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/", // redirect to home if login needed
  },
});
