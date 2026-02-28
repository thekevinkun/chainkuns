// ============================================
// proxy.ts — Route Protection
// for per-route request interception.
//
// This file protects:
// - /dashboard and /events/create → requires organizer session
// - /tickets and /profile → requires any wallet session
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require the user to be logged in (any wallet)
const USER_PROTECTED_ROUTES = [
  "/tickets", // My Tickets page
  "/profile", // User profile
];

// Routes that require the user to be an approved organizer
const ORGANIZER_PROTECTED_ROUTES = [
  "/dashboard", // Organizer dashboard
  "/events/create", // Create new event
  "/events/manage", // Manage existing event (matches /events/[id]/manage)
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response we can attach cookie updates to
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create Supabase client that can read session from cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Attach updated session cookies to the response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Get the current user session from cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Check user-protected routes ──
  const isUserProtected = USER_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isUserProtected && !user) {
    // Not logged in — redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ── Check organizer-protected routes ──
  const isOrganizerProtected = ORGANIZER_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isOrganizerProtected) {
    if (!user) {
      // Not logged in at all — redirect home
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if this user has a verified organizer profile
    const { data: organizer } = await supabase
      .from("organizer_profiles")
      .select("id, is_verified")
      .eq("user_id", user.id)
      .single();

    if (!organizer || !organizer.is_verified) {
      // User exists but is not a verified organizer
      // Redirect to organizer registration page
      return NextResponse.redirect(new URL("/organizer/register", request.url));
    }
  }

  // All checks passed — allow the request through
  return response;
}

// Tell Next.js which paths this middleware applies to
// Exclude static files and API routes (they handle their own auth)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)"],
};
