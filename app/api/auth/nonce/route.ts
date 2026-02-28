// ============================================
// Generates a fresh nonce for SIWE login
// Called by the frontend before asking user to sign
// The nonce proves the login request is fresh
// and prevents replay attacks
// ============================================

import { NextResponse } from "next/server";
import { generateNonce } from "@/lib/web3/siwe";

export async function GET() {
  // Generate a fresh random nonce
  const nonce = generateNonce();

  // Return it as JSON to the frontend
  return NextResponse.json({ nonce });
}
