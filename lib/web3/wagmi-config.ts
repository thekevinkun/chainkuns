// ============================================
// Wagmi Configuration — Chainkuns
// Sets up the blockchain connection for the app
// Only support Sepolia testnet for now
// ============================================

import { createConfig, http } from "wagmi"; // wagmi core
import { sepolia } from "wagmi/chains"; // Sepolia testnet chain config
import { getDefaultConfig } from "@rainbow-me/rainbowkit"; // RainbowKit helper that sets up common wallets automatically

// Build the Wagmi config using RainbowKit's helper
// This automatically adds MetaMask, WalletConnect, Coinbase Wallet, etc.
export const wagmiConfig = getDefaultConfig({
  appName: "Chainkuns", // shown inside wallet UIs when connecting

  // WalletConnect Project ID — required for WalletConnect v2
  // Get a free one at: https://cloud.walletconnect.com
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "",

  // Only Sepolia — users on any other chain will see "Wrong Network"
  chains: [sepolia],

  transports: {
    // Use Alchemy as our RPC node for reliable and fast Sepolia connections
    [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    ),
  },

  ssr: true, // prevents hydration mismatch between server and client rendering
});
