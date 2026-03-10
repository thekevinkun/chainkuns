import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event & { available: number };
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="card-surface-hover overflow-hidden">
        {/* ── Banner Image ── */}
        <div className="relative h-48 bg-gradient-to-br from-accent-violet/30 to-accent-cyan/20 overflow-hidden">
          {event.banner_image_url ? (
            <Image
              src={event.banner_image_url}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            // Fallback if no banner image yet
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🎟️
            </div>
          )}

          {/* Status badge — top right corner */}
          <div className="absolute top-3 right-3">
            <Badge
              variant={event.status === "active" ? "active" : "cancelled"}
              dot
            >
              {event.status === "active" ? "Live" : event.status}
            </Badge>
          </div>
        </div>

        {/* ── Card Body ── */}
        <div className="p-5 flex flex-col gap-3">
          {/* Event title */}
          <h3 className="font-display font-bold text-text-primary text-lg leading-tight group-hover:gradient-text transition-colors line-clamp-2">
            {event.title}
          </h3>

          {/* Venue + Date */}
          <div className="flex flex-col gap-1.5">
            {/* Venue */}
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span>📍</span>
              <span className="truncate">{event.venue}</span>
            </div>
            {/* Date */}
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span>📅</span>
              <span>
                {new Date(event.event_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="divider my-0" />

          {/* Price + Supply row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs mb-0.5">Price</p>
              <p className="mono-text font-semibold">
                {event.ticket_price_eth} ETH
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-xs mb-0.5">Available</p>
              <p className="text-text-primary font-semibold text-sm">
                {event.available} / {event.total_supply}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
