// ============================================
// Supabase Browser Client — Chainkuns
// Used in Client Components (anything with 'use client')
// Uses the anon key which is safe to expose in the browser
// ============================================

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// Creates a Supabase client for use in the browser
// Call this function inside your client components when you need to query the database
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
