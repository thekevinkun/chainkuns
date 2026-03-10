import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import type { Ticket } from "@/types";
import { getTxUrl, formatDateShort, ipfsToHttp } from "@/lib/utils/format";

interface TicketCardProps {
  ticket: Ticket;
}

const TicketCard = ({ ticket }: TicketCardProps) => {
  // The event data is joined from Supabase when fetching tickets
  const event = ticket.event;

  return (
    <div
      className="card-surface flex flex-col gap-0 overflow-hidden rounded-2xl border border-border 
        hover:border-border-hover transition-colors"
    >
      {/* Event banner image */}
      <div className="relative w-full h-40 bg-gradient-to-br from-accent-violet/30 to-accent-cyan/20">
        {event?.banner_image_url ? (
          <Image
            src={ipfsToHttp(event.banner_image_url)} // convert ipfs:// to https://
            alt={event?.title ?? "Event"}
            fill
            className="object-cover"
          />
        ) : (
          // Fallback if no banner
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
              <span className="text-text-secondary text-sm">{event.venue}</span>
            </div>
          )}
        </div>

        <div className="divider my-0" />

        {/* Footer — tx link + view ticket */}
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

          {/* View ticket detail page — built in Step 8 */}
          <Link
            href={`/tickets/${ticket.token_id}`}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
