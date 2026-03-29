// ============================================
// auth.ts — NextAuth v5 Configuration
// This is the main auth config for the entire app
// Handles SIWE (Sign In With Ethereum) login flow
// ============================================

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { SiweMessage } from "siwe";
import { createServiceClient } from "@/lib/supabase/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // We use JWT strategy — session stored in a cookie, not a database
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours — re-sign daily, Web3 standard
  },

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
          // Read the nonce that our server issued just before the SIWE request.
          const cookieStore = await cookies();
          const expectedNonce = cookieStore.get("siwe-nonce")?.value;

          // If there is no stored nonce, this login attempt is invalid.
          if (!expectedNonce) {
            return null;
          }

          // Parse the SIWE message from the credentials
          const siwe = new SiweMessage(credentials?.message as string);

          // Verify both the signature and the nonce issued by our server.
          // This proves the user owns the wallet and signed the expected challenge.
          const result = await siwe.verify({
            signature: credentials?.signature as string,
            nonce: expectedNonce,
          });

          if (!result.success) {
            // Signature is invalid — reject login
            return null;
          }

          // Clear the one-time nonce after successful verification.
          // This keeps the nonce single-use and avoids leaving it around in cookies.
          cookieStore.delete("siwe-nonce");

          // Signature is valid — get the wallet address
          const walletAddress = siwe.address;

          // Connect to Supabase to find or create the user
          const supabase = createServiceClient();

          // Check if this wallet already has an account
          const { data: existingUser, error: errorExistingUser } =
            await supabase
              .from("users")
              .select("id, wallet_address")
              .eq("wallet_address", walletAddress.toLowerCase())
              .single();

          // PGRST116 = no row found — means first-time user, not a real error
          if (errorExistingUser && errorExistingUser.code !== "PGRST116") {
            console.error("Fetch user error:", errorExistingUser);
            return null;
          }

          if (existingUser) {
            // User already exists — return their info
            return {
              id: existingUser.id,
              address: existingUser.wallet_address,
            };
          }

          // First time login — create a new user record
          const { data: newUser, error: errorNewUser } = await supabase
            .from("users")
            .insert({ wallet_address: walletAddress.toLowerCase() })
            .select("id, wallet_address")
            .single();

          if (errorNewUser || !newUser) {
            // Failed to create user
            return null;
          }

          // Return the new user's info
          return {
            id: newUser.id,
            address: newUser.wallet_address,
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
    async jwt({ token, user }) {
      if (user) {
        // Cast to access our custom fields
        const u = user as { id: string; address: string };
        token.id = u.id;
        token.address = u.address;
      }

      // Re-fetch organizer status on every JWT refresh — not just at login
      // This ensures approval/rejection is reflected immediately without re-signing
      if (token.id) {
        const supabase = createServiceClient();
        const { data: organizer } = await supabase
          .from("organizer_profiles")
          .select("id, status")
          .eq("user_id", token.id as string)
          .single();

        token.organizerStatus = organizer?.status ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.address = token.address as string;
      session.user.organizerStatus = token.organizerStatus as string | null;
      return session;
    },
  },

  pages: {
    signIn: "/", // redirect to home if login needed
  },
});
