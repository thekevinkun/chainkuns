// ============================================
// Custom styled wallet connect button + SIWE login
// Handles:
// 1. Beautiful custom UI (from Phase 0)
// 2. SIWE sign in flow when wallet connects
// ============================================

"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { buildSiweMessage } from "@/lib/web3/siwe";
import { cn } from "@/lib/utils/cn";

interface WalletConnectProps {
  className?: string; // optional extra classes from parent
}

export default function WalletConnect({ className }: WalletConnectProps) {
  // Get connected wallet info from wagmi
  const { address, chainId, isConnected } = useAccount();

  // NextAuth session — tells us if user is fully signed in
  const { data: session } = useSession();

  // wagmi hook to request a signature from MetaMask
  const { signMessageAsync } = useSignMessage();

  // Ref to prevent signing twice if component re-renders
  const hasSigned = useRef(false);

  // ── SIWE Sign In Flow ──
  useEffect(() => {
    // Only run if wallet is connected but no NextAuth session yet
    if (!isConnected || !address || !chainId || session || hasSigned.current) {
      return;
    }

    // Mark as signing to prevent double execution
    hasSigned.current = true;

    async function siweSignIn() {
      try {
        // Step 1 — fetch a fresh nonce from our server
        const nonceRes = await fetch("/api/auth/nonce");
        const { nonce } = await nonceRes.json();

        // Step 2 — build the message the user will sign in MetaMask
        const message = buildSiweMessage({
          address: address!,
          nonce,
          chainId: chainId!,
        });

        // Step 3 — ask user to sign the message in MetaMask
        const signature = await signMessageAsync({ message });

        // Step 4 — send message + signature to NextAuth to create session
        await signIn("credentials", {
          message: JSON.stringify({
            domain: window.location.host,
            address,
            statement:
              "Sign in to Chainkuns. This request will not trigger a blockchain transaction or cost any gas fees.",
            uri: window.location.origin,
            version: "1",
            chainId,
            nonce,
          }),
          signature,
          redirect: false, // don't redirect after sign in
        });
      } catch (error) {
        // User rejected signature or something went wrong
        console.error("SIWE sign in failed:", error);
        hasSigned.current = false; // reset so they can try again
      }
    }

    siweSignIn();
  }, [isConnected, address, chainId, session, signMessageAsync]);

  // ── Sign Out When Wallet Disconnects ──
  useEffect(() => {
    if (!isConnected && session) {
      signOut({ redirect: false });
      hasSigned.current = false;
    }
  }, [isConnected, session]);

  // ── Custom UI ──
  return (
    <ConnectButton.Custom>
      {({
        account, // connected wallet info
        chain, // current network
        openAccountModal, // opens account management modal
        openChainModal, // opens network switcher modal
        openConnectModal, // opens wallet selection modal
        mounted, // true once RainbowKit has loaded
      }) => {
        // Don't render until RainbowKit is ready
        // Prevents hydration mismatch
        if (!mounted) {
          return (
            <div
              className={cn("h-10 w-36 skeleton rounded-lg", className)}
              aria-hidden="true"
            />
          );
        }

        // ── Not Connected ──
        if (!account) {
          return (
            <button
              onClick={openConnectModal}
              className={cn("btn-primary btn-sm", className)}
            >
              Connect Wallet
            </button>
          );
        }

        // ── Wrong Network ──
        if (chain?.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className={cn("btn-danger btn-sm", className)}
            >
              Wrong Network
            </button>
          );
        }

        // ── Connected ──
        return (
          <div className="flex items-center gap-2">
            {/* Network indicator — click to switch network */}
            {chain && (
              <button
                onClick={openChainModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-border-hover transition-colors text-xs text-text-secondary"
              >
                {/* Green dot = correct network */}
                <span
                  className="w-1.5 h-1.5 rounded-full bg-success"
                  aria-hidden="true"
                />
                {chain.name}
              </button>
            )}

            {/* Account button — click to open account modal */}
            <button
              onClick={openAccountModal}
              className={cn(
                "flex items-center gap-2",
                "px-3 py-2 rounded-lg",
                "border border-border hover:border-border-hover",
                "transition-colors",
                "text-xs",
                className,
              )}
            >
              {/* Pulse indicator if transaction is pending */}
              {account.hasPendingTransactions && (
                <span
                  className="w-2 h-2 rounded-full bg-warning animate-pulse"
                  aria-hidden="true"
                />
              )}

              {/* Shortened wallet address e.g. 0x1234...5678 */}
              <span className="mono-text text-xs">{account.displayName}</span>

              {/* ETH balance — hidden on small screens */}
              {account.displayBalance && (
                <span className="text-text-secondary hidden lg:inline">
                  {account.displayBalance}
                </span>
              )}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
