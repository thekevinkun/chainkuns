import EventCard from "@/components/events/EventCard";
import { EventCardSkeleton } from "@/components/ui/Skeleton";
import type { Event } from "@/types";

interface EventGridProps {
  events: (Event & { available: number })[];
  isLoading?: boolean;
}

// How many skeleton cards to show while loading
const SKELETON_COUNT = 6;

const EventGrid = ({ events, isLoading = false }: EventGridProps) => {
  // ── Loading state — show skeleton placeholders ──
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ── Empty state — no events found ──
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <span className="text-6xl">🎟️</span>
        <h3 className="font-display font-bold text-text-primary text-xl">
          No events found
        </h3>
        <p className="text-text-secondary text-sm max-w-xs">
          Try adjusting your filters or check back later for upcoming events.
        </p>
      </div>
    );
  }

  // ── Events grid ──
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventGrid;
