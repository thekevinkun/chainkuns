// ============================================
// Providers Component — Chainkuns
// Wraps the entire app with necessary context providers.
// Order matters — wrong nesting = runtime crash.
//
// Nesting order (outer to inner):
// WagmiProvider → QueryClientProvider → RainbowKitProvider → SessionProvider
// ============================================

"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { SessionProvider } from "next-auth/react";
import { wagmiConfig } from "@/lib/web3/wagmi-config";

// ── Import RainbowKit styles ──
import "@rainbow-me/rainbowkit/styles.css";

// Create the QueryClient outside the component so it's not recreated on re-render
// This caches all blockchain and API query results
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // data stays fresh for 1 minute before refetching
      retry: 2, // retry failed requests twice before giving up
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode; // the entire app tree goes here
}

export default function Providers({ children }: ProvidersProps) {
  return (
    /* 1. WagmiProvider — gives all components access to blockchain connection */
    <WagmiProvider config={wagmiConfig}>
      {/* 2. QueryClientProvider — enables caching of blockchain + API calls */}
      <QueryClientProvider client={queryClient}>
        {/* 3. RainbowKitProvider — wallet selection UI (must be inside Wagmi + Query) */}
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00d4aa", // cyan accent matches our brand
            accentColorForeground: "#0a0f0f", // dark text on cyan button
            borderRadius: "medium", // rounded corners on wallet modal
            fontStack: "system", // use system fonts in wallet UI
          })}
        >
          {/* 4. SessionProvider — NextAuth session (user's SIWE login state) */}
          <SessionProvider>{children}</SessionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
