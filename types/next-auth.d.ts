// ============================================
// types/next-auth.d.ts — NextAuth Type Extensions
// Extends the default NextAuth types to include
// our custom fields (wallet address, user ID)
// ============================================

import { DefaultSession } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Supabase user ID
      address: string; // Ethereum wallet address
      organizerStatus: string | null;
    } & DefaultSession["user"]; // keep the default fields (name, email, image)
  }

  interface JWT {
    id: string; // Supabase user ID
    address: string; // Ethereum wallet address
    organizerStatus: string | null;
  }
}
