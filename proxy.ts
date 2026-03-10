// ============================================
// Route Protection
// Intercepts every request and checks if the user
// is allowed to access the requested route
//
// Protected routes:
// - /user/tickets, /profile → requires wallet login (any user)
// - /dashboard, /events/create, /events/manage → requires verified organizer
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Fully public routes — skip ALL checks, no auth() call
const PUBLIC_ROUTES = [
  "/",
  "/events",
  "/organizer/pending",
  "/organizer/rejected",
  "/organizer/register",
];

// Routes any logged-in wallet user can access
const USER_PROTECTED_ROUTES = [
  "/my-tickets", // My Tickets page
  "/tickets",
  "/profile",
];

// Routes only verified organizers can access
const ORGANIZER_PROTECTED_ROUTES = [
  "/dashboard",
  "/events/create",
  "/events/manage",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes immediately
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip public routes immediately — no auth() call at all
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) {
    return NextResponse.next();
  }

  // Only call auth() for protected routes
  const session = await auth();

  // ── User protected routes ──
  const isUserProtected = USER_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isUserProtected && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ── Organizer protected routes ──
  const isOrganizerProtected = ORGANIZER_PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isOrganizerProtected) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Read status directly from JWT — zero database calls
    const status = session.user.organizerStatus;

    if (!status) {
      return NextResponse.redirect(new URL("/organizer/register", request.url));
    }
    if (status === "pending") {
      return NextResponse.redirect(new URL("/organizer/pending", request.url));
    }
    if (status === "rejected") {
      return NextResponse.redirect(new URL("/organizer/rejected", request.url));
    }

    // status === "approved" — let them through
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  // All checks passed
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)"],
};
