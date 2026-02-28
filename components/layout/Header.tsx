"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "@/components/web3/WalletConnect";

import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/lib/constants";

const Header = () => {
  // Controls mobile menu open/closed state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Current URL path — used to highlight active nav link
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-base/80 backdrop-blur-md">
      {/* Center-constrained layout container */}
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* ── Brand Logo (Left) ── */}
          <Link href="/" className="flex items-center gap-1 group">
            {/* CHAIN in gradient, kuns in white — typographic wordmark */}
            <span className="font-display font-bold text-xl tracking-tight">
              <span className="gradient-text">CHAIN</span>
              <span className="text-text-primary">kuns</span>
            </span>
          </Link>

          {/* ── Desktop Navigation (Center) ── */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-text-primary bg-bg-elevated" // active: highlighted
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50", // inactive
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Right Side: Wallet + Mobile Toggle ── */}
          <div className="flex items-center gap-3">
            {/* Wallet connection button — shows address when connected */}
            <WalletConnect />

            {/* Mobile hamburger button — only visible on small screens */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden btn-ghost p-2"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
            >
              {/* Toggle between hamburger and X icon */}
              {isMobileOpen ? (
                // X icon for close
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                // Hamburger icon for open
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6h14M3 10h14M3 14h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {/* Slides down when hamburger is clicked on mobile */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-border bg-bg-base">
          <nav
            className="section-container py-4 flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)} // close menu on link click
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-text-primary bg-bg-elevated"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Dashboard link — only show if user is an organizer (Phase 3+) */}
            <Link
              href="/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Organizer Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
