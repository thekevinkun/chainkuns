"use client";

import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-3 border-border">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* ── Brand Column (Left) ── */}
          <div className="md:col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center">
              <span className="font-display font-bold text-xl">
                <span className="gradient-text">CHAIN</span>
                <span className="text-text-primary">kuns</span>
              </span>
            </Link>

            {/* Tagline */}
            <p className="mt-4 text-text-secondary text-sm leading-relaxed max-w-xs">
              The future of event ticketing is on-chain. Buy, sell, and verify
              tickets as NFTs with automatic royalties for organizers.
            </p>

            {/* Sepolia testnet notice */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-surface">
              {/* Pulsing green dot — indicates live testnet connection */}
              <span
                className="w-2 h-2 rounded-full bg-success animate-pulse"
                aria-hidden="true"
              />
              <span className="text-xs text-text-secondary font-mono">
                Sepolia Testnet
              </span>
            </div>
          </div>

          {/* ── Link Columns (Right) ── */}
          {Object.entries(FOOTER_LINKS).map(([groupName, links]) => (
            <div key={groupName}>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
                {groupName}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ── */}
        <div className="divider" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p>
            © {currentYear} Chainkuns. Portfolio project — not for commercial
            use.
          </p>
          <p>
            Built with {/* Tech stack callout */}
            <span className="mono-text">Next.js 16 · Solidity · Supabase</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
