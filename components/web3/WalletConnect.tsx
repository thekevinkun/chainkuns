// ============================================
// WalletConnect Component — Chainkuns
// Wraps RainbowKit's ConnectButton with custom
// styling that matches our design system.
// ============================================

"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils/cn";

interface WalletConnectProps {
  className?: string; // optional extra classes from parent
}

const WalletConnect = ({ className }: WalletConnectProps) => {
  return (
    // RainbowKit's render prop pattern — gives us full control over the button UI
    <ConnectButton.Custom>
      {({
        account, // connected wallet info (address, displayName, etc.)
        chain, // current blockchain network
        openAccountModal, // opens the account management modal
        openChainModal, // opens the network switcher modal
        openConnectModal, // opens the wallet selection modal
        mounted, // true once RainbowKit has loaded on the client
      }) => {
        // Don't render anything until RainbowKit is ready
        // Avoids hydration mismatch between server and client
        if (!mounted) {
          return (
            <div
              className={cn("h-10 w-36 skeleton rounded-lg", className)}
              aria-hidden="true"
            />
          );
        }

        // ── Not Connected ───────────────────────────────
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

        // ── Wrong Network ────────────────────────────────
        // User is connected but on wrong chain (e.g. Mainnet instead of Sepolia)
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

        // ── Connected ────────────────────────────────────
        // Show wallet info in a pill-style button
        return (
          <div className="flex items-center gap-2">
            {/* Network indicator — click to switch network */}
            {chain && (
              <button
                onClick={openChainModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-border-hover transition-colors text-xs text-text-secondary"
              >
                {/* Green dot = on correct network */}
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
              {/* Avatar — small circular avatar from RainbowKit */}
              {account.hasPendingTransactions && (
                // Spinner if there's a pending transaction
                <span
                  className="w-2 h-2 rounded-full bg-warning animate-pulse"
                  aria-hidden="true"
                />
              )}

              {/* Wallet address display — shortened (e.g. 0x1234...5678) */}
              <span className="mono-text text-xs">{account.displayName}</span>

              {/* ETH balance (if available) */}
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
