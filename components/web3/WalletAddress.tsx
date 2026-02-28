// ============================================
// WalletAddress Component — Chainkuns
// Displays a formatted wallet address with a
// copy-to-clipboard button and Etherscan link.
// ============================================

"use client";

import { useState } from "react";
import { formatAddress, getAddressUrl } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import Tooltip from "@/components/ui/Tooltip";

interface WalletAddressProps {
  address: string; // full ETH address to display
  chars?: number; // chars to show on each side (default: 4 → 0x1234...5678)
  showCopy?: boolean; // show copy button (default: true)
  showExplorer?: boolean; // show Etherscan link (default: false)
  className?: string;
}

const WalletAddress = ({
  address,
  chars = 4,
  showCopy = true,
  showExplorer = false,
  className,
}: WalletAddressProps) => {
  // Tracks whether the copy button just succeeded — shows checkmark briefly
  const [copied, setCopied] = useState(false);

  // Copy the full address to clipboard and show feedback
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      // Reset back to copy icon after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail in some browser contexts — silent fail
    }
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {/* Shortened address in monospace cyan font */}
      <span className="mono-text text-sm" title={address}>
        {formatAddress(address, chars)}
      </span>

      {/* Copy to clipboard button */}
      {showCopy && (
        <Tooltip content={copied ? "Copied!" : "Copy address"}>
          <button
            onClick={handleCopy}
            className="text-text-secondary hover:text-accent-cyan transition-colors"
            aria-label="Copy wallet address"
          >
            {copied ? (
              // Checkmark — shown for 2 seconds after successful copy
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7l3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              // Copy icon
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="1"
                  width="9"
                  height="9"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M1 5h3v7h7v3H1V5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </Tooltip>
      )}

      {/* Link to Etherscan (Sepolia) */}
      {showExplorer && (
        <Tooltip content="View on Etherscan">
          <a
            href={getAddressUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent-cyan transition-colors"
            aria-label="View on Etherscan"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 2H2v10h10V9M8 2h4m0 0v4m0-4L6 8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Tooltip>
      )}
    </div>
  );
};

export default WalletAddress;
