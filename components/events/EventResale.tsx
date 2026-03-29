import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getListingsByEvent } from "@/app/actions/listing";

import { ListingGrid, ListingGridSkeleton } from "@/components/marketplace";

import type { Event } from "@/types";

interface EventResaleProps {
  typedEvent: Event;
  eventId: string;
}

// ListingsContent
// Fetches listings for this specific event
const ListingsContent = async ({ eventId }: { eventId: string }) => {
  const result = await getListingsByEvent(eventId);

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-5xl">⚠️</span>
        <p className="text-text-secondary text-center">
          Failed to load listings. Please try again later.
        </p>
      </div>
    );
  }

  return <ListingGrid listings={result.data} />;
};

const EventResale = ({ typedEvent, eventId }: EventResaleProps) => {
  return (
    <main className="min-h-screen">
      {/* Event header */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Event banner thumbnail */}
            {typedEvent.banner_image_url && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={typedEvent.banner_image_url}
                  alt={typedEvent.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="flex flex-col gap-3 flex-1">
              {/* Breadcrumb */}
              {/* <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Link
                  href="/marketplace"
                  className="hover:text-text-primary transition-colors"
                >
                  Marketplace
                </Link>
                <span>→</span>
                <Link
                  href={`/events/${eventId}`}
                  className="hover:text-text-primary transition-colors"
                >
                  {typedEvent.title}
                </Link>
                <span>→</span>
                <span className="text-text-primary">Resale</span>
              </div> */}

              {/* Badge */}
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan w-fit">
                Resale Tickets
              </span>

              <h1 className="section-heading text-text-primary">
                {typedEvent.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                {/* Venue */}
                <span>📍 {typedEvent.venue}</span>

                {/* Event date */}
                <span>
                  📅{" "}
                  {new Date(typedEvent.event_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Link back to event detail */}
              <Link
                href={`/events/${eventId}`}
                className="text-accent-cyan text-sm hover:underline w-fit"
              >
                View event details →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Listings grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<ListingGridSkeleton />}>
          <ListingsContent eventId={eventId} />
        </Suspense>
      </section>
    </main>
  );
};

export default EventResale;
