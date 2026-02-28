// ============================================
// Supabase Server Client — Chainkuns
// Used in Server Components, Server Actions, and Route Handlers
// NEVER import this in client components
// ============================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

// Regular server client — respects RLS policies based on the user's session
export async function createClient() {
  const cookieStore = await cookies(); // get the cookie store from Next.js

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // anon key + session cookie = user-scoped queries
    {
      cookies: {
        // Supabase needs to read and write cookies to manage the user session
        getAll() {
          return cookieStore.getAll(); // read all cookies
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) =>
                cookieStore.set(name, value, options), // write updated session cookies
            );
          } catch {
            // This can throw in Server Components because they are read-only
            // It's fine — middleware handles session refresh automatically
          }
        },
      },
    },
  );
}

// Admin client — bypasses RLS completely, full database access
// Only use this for admin operations like approving organizers
// NEVER expose this to the browser
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!, // service key = full admin access, bypasses all RLS policies
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* same reason as above */
          }
        },
      },
    },
  );
}
