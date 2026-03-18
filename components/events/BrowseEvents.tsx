import { Suspense } from "react";
import { EventFilters, EventGrid } from "@/components/events";
import type { EventWithAvailable } from "@/types";

interface BrowseEventsProps {
  events: EventWithAvailable[];
  totalCount: number;
}

const BrowseEvents = ({ events, totalCount }: BrowseEventsProps) => {
  return (
    <main className="min-h-screen">
      {/* Page header */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">
              Browse Events
            </span>
            <h1 className="section-heading text-text-primary">
              Discover <span className="gradient-text">Events</span>
            </h1>
            <p className="text-text-secondary max-w-xl">
              {totalCount > 0
                ? `${totalCount} active event${
                    totalCount !== 1 ? "s" : ""
                  } available — buy tickets as NFTs, verified on-chain.`
                : "No events available right now — check back soon."}
            </p>
          </div>
        </div>
      </section>

      {/* Content — filters + grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filters */}
          <div className="lg:hidden">
            <Suspense fallback={null}>
              <EventFilters />
            </Suspense>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <Suspense fallback={null}>
                <EventFilters />
              </Suspense>
            </div>
          </aside>

          {/* Event grid */}
          <div className="flex-1 min-w-0">
            <EventGrid events={events} isLoading={false} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default BrowseEvents;