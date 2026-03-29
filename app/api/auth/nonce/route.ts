// ============================================
// Generates a fresh nonce for SIWE login
// Called by the frontend before asking user to sign
// The nonce proves the login request is fresh
// and prevents replay attacks
// ============================================

import { NextResponse } from "next/server";
import { generateNonce } from "@/lib/web3/siwe";

export async function GET() {
  // Create a new one-time nonce for the next SIWE login attempt.
  const nonce = generateNonce();

  // Build the JSON response that the browser will read.
  const response = NextResponse.json({ nonce });

  // Save the nonce in a secure cookie so the server can verify it later.
  response.cookies.set("siwe-nonce", nonce, {
    httpOnly: true, // Hide the nonce from client-side JavaScript.
    sameSite: "lax", // Allow normal same-site navigation while reducing CSRF risk.
    secure: process.env.NODE_ENV === "production", // Only require HTTPS in production.
    maxAge: 60 * 10, // Expire the nonce after 10 minutes.
    path: "/", // Make the cookie available to the whole app.
  });

  // Send the nonce back to the frontend and also store it in the cookie.
  return response;
}
