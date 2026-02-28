// ============================================
// Route Protection
// Intercepts every request and checks if the user
// is allowed to access the requested route
//
// Protected routes:
// - /tickets, /profile → requires wallet login (any user)
// - /dashboard, /events/create, /events/manage → requires verified organizer
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // NextAuth session checker
import { createServerClient } from "@supabase/ssr";

// Routes any logged-in wallet user can access
const USER_PROTECTED_ROUTES = [
  "/tickets", // My Tickets page
  "/profile", // User profile
];

// Routes only verified organizers can access
const ORGANIZER_PROTECTED_ROUTES = [
  "/dashboard", // Organizer dashboard
  "/events/create", // Create new event
  "/events/manage", // Manage existing event
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the NextAuth session from the request
  const session = await auth();

  // ── Check user-protected routes ──
  const isUserProtected = USER_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isUserProtected && !session) {
    // Not logged in — redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ── Check organizer-protected routes ──
  const isOrganizerProtected = ORGANIZER_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isOrganizerProtected) {
    if (!session) {
      // Not logged in — redirect home
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Create a response to attach cookie updates to
    const response = NextResponse.next({
      request: { headers: request.headers },
    });

    // Create Supabase client to check organizer status
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // Check if this user has a verified organizer profile
    const { data: organizer } = await supabase
      .from("organizer_profiles")
      .select("id, is_verified")
      .eq("user_id", session.user.id)
      .single();

    if (!organizer || !organizer.is_verified) {
      // Not a verified organizer — redirect to registration
      return NextResponse.redirect(new URL("/organizer/register", request.url));
    }
  }

  // All checks passed — allow the request through
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

// Tell Next.js which paths this proxy applies to
// Excludes static files, images, and API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)"],
};
