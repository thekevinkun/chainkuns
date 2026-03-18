import Link from "next/link";
import Image from "next/image";

import Badge from "@/components/ui/Badge";
import { VerifiedBadge } from "@/components/ui/Badge";
import { TicketPurchaseCard } from "@/components/events";

import type { Event } from "@/types";

interface EventHeroProps {
  event: Event;
  organizerName: string;
  organizerLogo: string | null;
  available: number;
}

const EventHero = ({
  event,
  organizerName,
  organizerLogo,
  available,
}: EventHeroProps) => {
  return (
    <div className="flex flex-col gap-0">
      {/* ── Full width banner image ── */}
      <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-accent-violet/30 to-accent-cyan/20 overflow-hidden">
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
          // Fallback banner
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎟️
          </div>
        )}

        {/* Status badge — top right */}
        <div className="absolute top-4 right-4">
          <Badge
            variant={event.status === "active" ? "active" : "cancelled"}
            dot
          >
            {event.status === "active" ? "Live" : event.status}
          </Badge>
        </div>
      </div>

      {/* ── Two column content ── */}
      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left: Event info (2/3 width) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Title */}
            <h1 className="section-heading text-text-primary">{event.title}</h1>

            {/* Organizer */}
            <div className="flex items-center gap-2">
              {organizerLogo ? (
                <Image
                  src={organizerLogo}
                  alt={organizerName}
                  width={48}
                  height={48}
                  sizes="48px"
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-violet/40 to-accent-cyan/40 flex items-center justify-center text-xs font-bold text-white">
                  {organizerName.charAt(0).toUpperCase()}{" "}
                  {/* first letter of organizer name */}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">
                  Organized by
                </span>
                <span className="text-text-primary text-sm font-semibold">
                  {organizerName}
                </span>
                <VerifiedBadge />
              </div>
            </div>

            {/* Date + Venue */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 card-surface px-4 py-3 rounded-xl flex-1">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-text-secondary text-xs uppercase tracking-wider mb-0.5">
                    Date & Time
                  </p>
                  <p className="text-text-primary text-sm font-semibold">
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 card-surface px-4 py-3 rounded-xl flex-1">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-text-secondary text-xs uppercase tracking-wider mb-0.5">
                    Venue
                  </p>
                  <p className="text-text-primary text-sm font-semibold">
                    {event.venue}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <h2 className="font-display font-bold text-text-primary text-lg">
                About this Event
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {event.description ?? "No description provided."}
              </p>
            </div>

            {/* Resale marketplace link — takes user to peer-to-peer listings for this event */}
            <Link
              href={`/events/${event.id}/resale`}
              className="flex items-center justify-between card-surface px-4 py-3 rounded-xl 
                  hover:border-accent-cyan/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="text-text-primary text-sm font-semibold">
                    Resale Tickets
                  </p>
                  <p className="text-text-secondary text-xs">
                    Buy peer-to-peer from other fans
                  </p>
                </div>
              </div>
              <span className="text-accent-cyan group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>

          {/* ── Right: Buy ticket card (1/3 width) ── */}
          <div className="lg:col-span-1">
            <TicketPurchaseCard event={event} available={available} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
