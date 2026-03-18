import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import {
  ContractControls,
  QRScanner,
  TicketSalesTable,
} from "@/components/tickets";

import type { Event, Ticket } from "@/types";

interface EventManageProps {
  event: Event;
  tickets: Ticket[];
}

const EventManage = ({ event, tickets }: EventManageProps) => {
  // ── Calculate stats ──
  const ticketsSold = tickets?.length ?? 0; // total tickets sold
  const ticketsUsed = tickets?.filter((t) => t.is_used).length ?? 0; // tickets used at door
  const revenue = ticketsSold * Number(event.ticket_price_eth); // total revenue in ETH

  return (
    <main className="section-container py-12 space-y-10">
      {/* ── Back link ── */}
      {/* <Link
        href="/dashboard"
        className="btn-ghost text-sm inline-flex items-center gap-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Dashboard
      </Link> */}

      {/* ── Event Header ── */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-accent-violet/30 to-accent-cyan/20">
        {event.banner_image_url ? (
          <Image
            src={event.banner_image_url}
            alt={event.title}
            fill
            priority // above the fold — load immediately
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          // Fallback if no banner
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎟
          </div>
        )}

        {/* Dark gradient overlay — makes text readable over image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Event info overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{event.title}</h1>
            <Badge
              variant={event.status === "active" ? "active" : "cancelled"}
              dot
            >
              {event.status === "active" ? "Live" : event.status}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-white/70 text-sm">📍 {event.venue}</p>
            <p className="text-white/70 text-sm">
              📅{" "}
              {new Date(event.event_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tickets Sold */}
        <div className="card-surface p-5 space-y-1">
          <p className="text-text-secondary text-xs uppercase tracking-wider">
            Tickets Sold
          </p>
          <p className="text-2xl font-bold text-text-primary mono-text">
            {ticketsSold}
            <span className="text-text-secondary text-sm font-normal">
              /{event.total_supply}
            </span>
          </p>
        </div>

        {/* Tickets Used */}
        <div className="card-surface p-5 space-y-1">
          <p className="text-text-secondary text-xs uppercase tracking-wider">
            Validated
          </p>
          <p className="text-2xl font-bold text-text-primary mono-text">
            {ticketsUsed}
            <span className="text-text-secondary text-sm font-normal">
              /{ticketsSold}
            </span>
          </p>
        </div>

        {/* Revenue */}
        <div className="card-surface p-5 space-y-1">
          <p className="text-text-secondary text-xs uppercase tracking-wider">
            Revenue
          </p>
          <p className="text-2xl font-bold text-text-primary mono-text">
            {revenue.toFixed(4)}
            <span className="text-text-secondary text-sm font-normal">
              {" "}
              ETH
            </span>
          </p>
        </div>

        {/* Ticket Price */}
        <div className="card-surface p-5 space-y-1">
          <p className="text-text-secondary text-xs uppercase tracking-wider">
            Ticket Price
          </p>
          <p className="text-2xl font-bold text-text-primary mono-text">
            {event.ticket_price_eth}
            <span className="text-text-secondary text-sm font-normal">
              {" "}
              ETH
            </span>
          </p>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Ticket Sales Table (2/3 width) ── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-text-primary">Ticket Sales</h2>
          <TicketSalesTable tickets={(tickets as Ticket[]) ?? []} />
        </div>

        {/* ── Right: Contract Controls + QR Scanner (1/3 width) ── */}
        <div className="space-y-6">
          {/* Contract Controls — pause/unpause */}
          {event.contract_address && (
            <ContractControls
              contractAddress={event.contract_address as `0x${string}`}
            />
          )}

          {/* QR Scanner — validate tickets at door */}
          {event.contract_address && <QRScanner />}
        </div>
      </div>
    </main>
  );
};

export default EventManage;
