// ============================================
// lib/web3/siwe.ts — Sign In With Ethereum Helpers
// Handles nonce generation and SIWE message creation
// A nonce is a random one-time string that proves
// the login request is fresh and not a replay attack
// ============================================

import { SiweMessage } from "siwe";

// Generates a random nonce string
// Called by the server before asking user to sign
export function generateNonce(): string {
  // crypto.randomUUID() gives us a random string like "a1b2c3d4-..."
  // We remove the dashes to make it cleaner
  return crypto.randomUUID().replace(/-/g, "");
}

// Builds the SIWE message that appears in MetaMask
// This is what the user sees and signs with their wallet
export function buildSiweMessage({
  address, // the wallet address logging in
  nonce, // the random nonce from the server
  chainId, // the blockchain network ID (11155111 = Sepolia)
}: {
  address: string;
  nonce: string;
  chainId: number;
}): string {
  const message = new SiweMessage({
    // The domain of your app (e.g. "chainkuns.vercel.app")
    domain: typeof window !== "undefined" ? window.location.host : "",

    // The wallet address that is signing
    address,

    // Human-readable explanation shown in MetaMask
    statement:
      "Sign in to Chainkuns. This request will not trigger a blockchain transaction or cost any gas fees.",

    // The full URL of your app
    uri: typeof window !== "undefined" ? window.location.origin : "",

    // SIWE version — always "1"
    version: "1",

    // The network the user is on (Sepolia = 11155111)
    chainId,

    // The one-time nonce — prevents the same signature being used twice
    nonce,
  });

  // Returns the message as a formatted string ready to be signed
  return message.prepareMessage();
}
