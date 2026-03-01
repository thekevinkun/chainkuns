import type { Metadata } from "next";
import EventGrid from "@/components/events/EventGrid";
import EventFilters from "@/components/events/EventFilters";

export const metadata: Metadata = {
  title: "Browse Events",
  description:
    "Discover upcoming events and buy tickets as NFTs. Verified organizers, automatic royalties, zero fraud.",
};

export default async function EventsPage() {
  return (
    <div className="section-container py-12">
      {/* ── Page Header ── */}
      <div className="mb-10">
        <h1 className="section-heading text-text-primary mb-2">
          Browse <span className="gradient-text">Events</span>
        </h1>
        <p className="text-text-secondary">
          Discover events and buy tickets as NFTs — verified on Ethereum.
        </p>
      </div>

      {/* ── Mobile filters — chips above grid ── */}
      <div className="lg:hidden mb-6">
        <EventFilters />
      </div>

      {/* ── Main Layout: Sidebar + Grid ── */}
      <div className="flex gap-8 items-start">
        {/* Left: Filters sidebar — fixed width */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-24">
          <EventFilters />
        </aside>

        {/* Right: Events grid — takes remaining space */}
        <div className="flex-1 min-w-0">
          {/* TODO Phase 5: pass real events from Supabase */}
          <EventGrid events={[]} isLoading={false} />
        </div>
      </div>
    </div>
  );
}
