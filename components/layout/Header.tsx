"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { WalletConnect } from "@/components/web3";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/lib/constants";

const Header = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Read organizer status directly from JWT session — no extra Supabase fetch needed
  const organizerStatus = session?.user?.organizerStatus ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-base/80 backdrop-blur-md">
      <div className="section-container">
        <div className="flex items-center h-16">
          {/* ── Brand Logo ── */}
          <Link href="/" className="flex flex-1 items-center gap-1 group">
            <span className="font-display font-bold text-xl tracking-tight">
              <span className="gradient-text">CHAIN</span>
              <span className="text-text-primary">kuns</span>
            </span>
          </Link>

          {/* ── Desktop Navigation ── */}
          <nav
            className="hidden lg:flex items-center gap-1 flex-shrink-0"
            aria-label="Main navigation"
          >
            {NAV_LINKS.filter((link) => !link.requiresAuth || !!session).map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "btn-ghost",
                    pathname === link.href
                      ? "text-text-primary bg-bg-elevated"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50",
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* ── Right Side: Wallet + Mobile Toggle ── */}
          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Dashboard — only for approved organizers */}
            {organizerStatus === "approved" && (
              <Link
                href="/dashboard"
                className={cn(
                  "hidden lg:flex btn-ghost text-accent-cyan",
                  pathname === "/dashboard"
                    ? "bg-bg-elevated"
                    : "hover:bg-bg-elevated/50",
                )}
              >
                Dashboard
              </Link>
            )}

            <WalletConnect />

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden btn-ghost p-2"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
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
      {isMobileOpen && (
        <div className="lg:hidden border-t border-border bg-bg-base">
          <nav
            className="section-container py-4 flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {/* Fixed — now filters requiresAuth links on mobile too */}
            {NAV_LINKS.filter((link) => !link.requiresAuth || !!session).map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "btn-ghost",
                    pathname === link.href
                      ? "text-text-primary bg-bg-elevated"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}

            {/* Dashboard — only for approved organizers */}
            {organizerStatus === "approved" && (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "btn-ghost text-accent-cyan",
                  pathname === "/dashboard"
                    ? "bg-bg-elevated"
                    : "hover:bg-bg-elevated/50",
                )}
              >
                Dashboard
              </Link>
            )}

            {/* Become an Organizer — only if logged in but not yet applied */}
            {session && !organizerStatus && (
              <Link
                href="/organizer/register"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "btn-ghost text-accent-cyan",
                  pathname === "/organizer/register"
                    ? "bg-bg-elevated"
                    : "hover:bg-bg-elevated/50",
                )}
              >
                Become an Organizer
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
