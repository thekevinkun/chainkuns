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
import { useCallback, useEffect, useRef, useState } from "react";
import { buildSiweMessage } from "@/lib/web3/siwe";
import { cn } from "@/lib/utils/cn";

interface WalletConnectProps {
  className?: string; // optional extra classes from parent
}

const WalletConnect = ({ className }: WalletConnectProps) => {
  // Get connected wallet info from wagmi
  const { address, chainId, isConnected, status } = useAccount();

  // NextAuth session — tells us if user is fully signed in
  const { data: session, status: sessionStatus } = useSession();

  // wagmi hook to request a signature from MetaMask
  const { signMessageAsync } = useSignMessage();

  // Track whether the user explicitly clicked "Connect Wallet".
  // We only auto-start SIWE after real user intent, not after passive reconnects.
  const shouldAutoSignInRef = useRef(false);

  // Hold the latest wagmi sign function without recreating our sign-in logic.
  const [isSigningIn, setIsSigningIn] = useState(false);
  const signMessageRef = useRef(signMessageAsync);

  const siweSignIn = useCallback(async () => {
    try {
      // Lock the sign-in flow so repeated clicks do not fire multiple requests.
      setIsSigningIn(true);
      console.log("Starting SIWE sign in flow", { address, chainId });
      // Step 1 — fetch a fresh nonce from our server
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // Stop early if the wallet details vanished before signing began.
      if (!address || !chainId) {
        return;
      }

      // Step 2 — build the message the user will sign in MetaMask
      const message = buildSiweMessage({
        address,
        nonce,
        chainId,
      });

      // Step 3 — ask user to sign the message in MetaMask
      const signature = await signMessageRef.current({ message });

      // Step 4 — send message + signature to NextAuth to create session
      await signIn("credentials", {
        message,
        signature,
        redirect: false, // don't redirect after sign in
      });
    } catch (error) {
      // User rejected signature or something went wrong
      console.error("SIWE sign in failed:", error);
    } finally {
      // Unlock the sign-in flow after success or failure.
      setIsSigningIn(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    // Always keep the ref pointed at the newest sign function from wagmi.
    signMessageRef.current = signMessageAsync;
  }, [signMessageAsync]);

  useEffect(() => {
    // Stop waiting for auto sign-in once a real app session already exists.
    if (session) {
      shouldAutoSignInRef.current = false;
      return;
    }

    // Clear the intent flag if the wallet is not connected anymore.
    if (!isConnected) {
      shouldAutoSignInRef.current = false;
      return;
    }

    // Only auto-start SIWE after the user explicitly clicked connect.
    if (!shouldAutoSignInRef.current) return;

    // Wait until NextAuth finishes checking whether a session already exists.
    if (sessionStatus === "loading") return;

    // Do not auto-sign if required wallet data is still missing.
    if (!address || !chainId) return;

    // Do not auto-sign while another sign-in request is already running.
    if (isSigningIn) return;

    // Consume the one-time connect intent before starting SIWE.
    shouldAutoSignInRef.current = false;
    void siweSignIn();
  }, [
    isConnected,
    address,
    chainId,
    session,
    sessionStatus,
    isSigningIn,
    siweSignIn,
  ]);

  const mounted = useRef(false);

  useEffect(() => {
    console.log("RainbowKit mounted");
    mounted.current = true;
  }, []);

  // ── Sign Out When Wallet Disconnects ──
  useEffect(() => {
    if (!session) return;
    if (isConnected) return;
    if (status === "reconnecting" || status === "connecting") return;

    // Wait 5 seconds before signing out
    // This gives wagmi time to reconnect on page refresh
    const timer = setTimeout(() => {
      if (!isConnected) {
        console.log("Wallet disconnected — signing out");
        signOut({ redirect: false });
        // Reset the auto-sign flag after a real disconnect.
        shouldAutoSignInRef.current = false;
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isConnected, session, status]);

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
              onClick={() => {
                // Mark this connection attempt as user-initiated.
                shouldAutoSignInRef.current = true;
                openConnectModal();
              }}
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
              onClick={() => {
                // If the wallet is connected but the app session is missing,
                // clicking the wallet button should start SIWE again.
                if (!session) {
                  void siweSignIn();
                  return;
                }

                // If the app session exists, open the normal wallet account modal.
                openAccountModal();
              }}
              disabled={isSigningIn}
              className={cn(
                "flex items-center gap-2",
                "px-3 py-2 rounded-lg",
                "border border-border hover:border-border-hover",
                "transition-colors",
                "text-xs",
                isSigningIn && "opacity-60 cursor-not-allowed",
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
              <span className="mono-text text-xs">
                {isSigningIn ? "Signing In..." : account.displayName}
              </span>

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
};

export default WalletConnect;
