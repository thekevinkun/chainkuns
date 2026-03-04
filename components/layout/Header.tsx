"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "@/components/web3";

import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

const Header = () => {
  // Controls mobile menu open/closed state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Current URL path — used to highlight active nav link
  const pathname = usePathname();

  // Check if user is logged in and if they are an organizer (for dashboard link)
  const { data: session } = useSession();
  const [organizerStatus, setOrganizerStatus] = useState<string | null>(null);

  // Fetch organizer status when session changes
  useEffect(() => {
    if (!session?.user?.address) {
      setOrganizerStatus(null);
      return;
    }

    async function fetchOrganizerStatus() {
      const supabase = createClient();

      // Get user ID from wallet address
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", session!.user.address)
        .single();

      if (!user) return;

      // Get organizer profile status
      const { data: profile } = await supabase
        .from("organizer_profiles")
        .select("status")
        .eq("user_id", user.id)
        .single();

      setOrganizerStatus(profile?.status ?? null); // null = not applied yet
    }

    fetchOrganizerStatus();
  }, [session]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-base/80 backdrop-blur-md">
      {/* Center-constrained layout container */}
      <div className="section-container">
        <div className="flex items-center h-16">
          {/* ── Brand Logo (Left) ── */}
          <Link href="/" className="flex flex-1 items-center gap-1 group">
            {/* CHAIN in gradient, kuns in white — typographic wordmark */}
            <span className="font-display font-bold text-xl tracking-tight">
              <span className="gradient-text">CHAIN</span>
              <span className="text-text-primary">kuns</span>
            </span>
          </Link>

          {/* ── Desktop Navigation (Center) ── */}
          <nav
            className="hidden md:flex items-center gap-1 flex-shrink-0"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "btn-ghost",
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
          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Dashboard — only for approved organizers */}
            {organizerStatus === "approved" && (
              <Link
                href="/dashboard"
                className={cn(
                  "hidden md:flex btn-ghost text-accent-cyan",
                  pathname === "/dashboard"
                    ? "bg-bg-elevated" // active: highlighted
                    : "hover:bg-bg-elevated/50", // inactive
                )}
              >
                Dashboard
              </Link>
            )}

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
                  "btn-ghost",
                  pathname === link.href
                    ? "text-text-primary bg-bg-elevated"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Dashboard — only for approved organizers */}
            {organizerStatus === "approved" && (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "btn-ghost text-accent-cyan",
                  pathname === "/dashboard"
                    ? "bg-bg-elevated" // active: highlighted
                    : "hover:bg-bg-elevated/50", // inactive
                )}
              >
                Dashboard
              </Link>
            )}

            {/* Become an Organizer — only if not yet applied */}
            {session && !organizerStatus && (
              <Link
                href="/organizer/register"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "btn-ghost text-accent-cyan",
                  pathname === "/dashboard"
                    ? "bg-bg-elevated" // active: highlighted
                    : "hover:bg-bg-elevated/50", // inactive
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
