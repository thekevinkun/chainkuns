import type { Metadata, Viewport } from "next";
import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "@/styles/globals.css";

// ── Font Configuration ──
// next/font handles loading, subsetting, and zero-layout-shift

// Syne — display/hero headings
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne", // CSS variable name (matches @theme token)
  display: "swap", // show fallback font until Syne loads (prevents invisible text)
});

// Inter — body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// JetBrains Mono — wallet addresses, tx hashes, code
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// ── Metadata ──
export const metadata: Metadata = {
  // Base URL for all relative OG image URLs
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),

  title: {
    default: "Chainkuns — The Future of Event Ticketing is On-Chain",
    template: "%s | Chainkuns", // individual pages add their title before the pipe
  },

  description:
    "Buy, sell, and verify event tickets as NFTs. Automatic royalties for organizers. Powered by Ethereum.",

  keywords: [
    "NFT tickets",
    "Web3 events",
    "blockchain ticketing",
    "Ethereum",
    "NFT",
  ],

  // Open Graph tags — shown when sharing on Twitter, Discord, LinkedIn
  openGraph: {
    type: "website",
    siteName: "Chainkuns",
    images: ["/og-image.png"], // 1200x630 image in /public
  },

  // Twitter/X card
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },

  // Favicon and web manifest
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// ── Viewport ──
export const viewport: Viewport = {
  themeColor: "#0a0f0f", // matches --color-bg-base (dark browser chrome on mobile)
};

// ── Layout Component ──
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[
        syne.variable, // makes --font-syne available for CSS
        inter.variable, // makes --font-inter available
        jetbrainsMono.variable, // makes --font-jetbrains-mono available
      ].join(" ")}
    >
      <body>
        {/* All providers wrap the entire app tree */}
        <Providers>
          {/* Sticky navigation header */}
          <Header />

          {/* Main content area — each page renders here */}
          <main className="min-h-screen">{children}</main>

          {/* Site footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
