// ============================================
// NetworkBadge Component — Chainkuns
// Small indicator showing which blockchain
// network the user is connected to.
// Sepolia = expected. Mainnet = warning.
// ============================================

"use client";

import { useChainId } from "wagmi";
import { cn } from "@/lib/utils/cn";

// Chain ID constants — prevents magic numbers in code
const CHAIN_IDS = {
  SEPOLIA: 11155111, // Sepolia testnet — expected for Chainkuns
  MAINNET: 1, // Ethereum mainnet — should warn user
} as const;

// Display config for each known chain
const CHAIN_INFO: Record<number, { label: string; color: string }> = {
  [CHAIN_IDS.SEPOLIA]: { label: "Sepolia", color: "bg-success" }, // green — correct
  [CHAIN_IDS.MAINNET]: { label: "Mainnet", color: "bg-warning" }, // yellow — wrong chain
};

interface NetworkBadgeProps {
  className?: string;
}

const NetworkBadge = ({ className }: NetworkBadgeProps) => {
  // Get the currently connected chain ID from Wagmi
  const chainId = useChainId();

  // Look up display info for this chain
  const chainInfo = CHAIN_INFO[chainId];

  // Don't render if we don't recognize the chain
  if (!chainInfo) return null;

  const isSepolia = chainId === CHAIN_IDS.SEPOLIA;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-1",
        "rounded-full border border-border",
        "text-xs text-text-secondary",
        !isSepolia && "border-warning/40", // highlight border on wrong network
        className,
      )}
    >
      {/* Network status dot */}
      <span
        className={cn("w-1.5 h-1.5 rounded-full", chainInfo.color)}
        aria-hidden="true"
      />

      {/* Chain name */}
      <span className="font-mono">{chainInfo.label}</span>

      {/* Warning text on wrong network */}
      {!isSepolia && <span className="text-warning">⚠</span>}
    </div>
  );
};

export default NetworkBadge;
