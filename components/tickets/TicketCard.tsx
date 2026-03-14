// ============================================
// TicketCard Component — Chainkuns
// Displays a single owned ticket with:
// - Event info, date, venue
// - Valid/Used badge
// - Link to ticket detail page
// - Resale button (opens ResaleModal)
// ============================================
"use client"; // needs to be client — handles modal open/close state

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { ResaleModal } from "@/components/tickets";
import type { Ticket } from "@/types";
import { getTxUrl, formatDateShort, ipfsToHttp } from "@/lib/utils/format";

interface TicketCardProps {
  ticket: Ticket;
}

const TicketCard = ({ ticket }: TicketCardProps) => {
  // controls whether the resale modal is open
  const [isResaleModalOpen, setIsResaleModalOpen] = useState(false);

  const event = ticket.event;

  return (
    <>
      <div
        className="card-surface flex flex-col gap-0 overflow-hidden rounded-2xl border border-border 
          hover:border-border-hover transition-colors"
      >
        {/* Event banner image */}
        <div className="relative w-full h-40 bg-gradient-to-br from-accent-violet/30 to-accent-cyan/20">
          {event?.banner_image_url ? (
            <Image
              src={ipfsToHttp(event.banner_image_url)}
              alt={event?.title ?? "Event"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🎟
            </div>
          )}

          {/* Used / Valid badge — top right */}
          <div className="absolute top-3 right-3">
            <Badge variant={ticket.is_used ? "cancelled" : "active"} dot>
              {ticket.is_used ? "Used" : "Valid"}
            </Badge>
          </div>

          {/* Token ID — top left */}
          <div className="absolute top-3 left-3 bg-bg-base/80 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="mono-text text-xs font-semibold">
              #{ticket.token_id}
            </span>
          </div>
        </div>

        {/* Ticket info */}
        <div className="p-5 flex flex-col gap-4">
          {/* Event title */}
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">
              Event
            </p>
            <h3 className="font-display font-bold text-text-primary text-base leading-snug">
              {event?.title ?? "Unknown Event"}
            </h3>
          </div>

          {/* Date + Venue row */}
          <div className="flex flex-col gap-1.5">
            {event?.event_date && (
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <span className="text-text-secondary text-sm">
                  {formatDateShort(event.event_date)}
                </span>
              </div>
            )}
            {event?.venue && (
              <div className="flex items-center gap-2">
                <span className="text-base">📍</span>
                <span className="text-text-secondary text-sm">
                  {event.venue}
                </span>
              </div>
            )}
          </div>

          <div className="divider my-0" />

          {/* Footer — tx link + actions */}
          <div className="flex items-center justify-between">
            {/* Etherscan tx link */}
            {ticket.mint_tx_hash ? (
              <Link
                href={getTxUrl(ticket.mint_tx_hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-text text-xs hover:opacity-80 transition-opacity"
              >
                {ticket.mint_tx_hash.slice(0, 6)}...
                {ticket.mint_tx_hash.slice(-4)} ↗
              </Link>
            ) : (
              <span className="text-text-secondary text-xs">No tx hash</span>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Resale button — only show if ticket is valid and not used */}
              {!ticket.is_used && (
                <button
                  onClick={() => setIsResaleModalOpen(true)}
                  className="btn-ghost text-xs px-3 py-1.5"
                >
                  Resale
                </button>
              )}

              {/* View ticket detail page */}
              <Link
                href={`/tickets/${ticket.token_id}`}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                View →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Resale modal — only mounts when open */}
      {isResaleModalOpen && (
        <ResaleModal
          ticket={ticket}
          onClose={() => setIsResaleModalOpen(false)}
        />
      )}
    </>
  );
};

export default TicketCard;
