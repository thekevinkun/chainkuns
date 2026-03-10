import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

import { EventFilters, EventGrid } from "@/components/events";

import type { Event, EventWithTicketCount } from "@/types";

export const metadata: Metadata = {
  title: "Browse Events",
  description:
    "Discover upcoming events and buy tickets as NFTs. Verified organizers, automatic royalties, zero fraud.",
};

export default async function EventsPage() {
  // Create the Supabase client for server-side usage (reads cookies for auth if needed)
  const supabase = await createClient();

  // Query the events table — only fetch active events, sorted by soonest first
  const { data, error } = await supabase
    .from("events") // target the events table
    .select("*, tickets(count)") // fetch all columns (matches our Event type)
    .eq("status", "active") // only show active events (not draft/cancelled)
    .order("event_date", { ascending: true }) // soonest events first
    .limit(50); // cap at 50 events per page (pagination later)

  // If Supabase returns an error, log it and show empty grid gracefully
  // We don't throw — a broken events list shouldn't crash the whole page
  if (error) {
    console.error("[EventsPage] Supabase error:", error.message); // log for debugging
  }

  // Cast the result to our Event type — Supabase returns generic rows
  // If data is null (error case), fall back to empty array
  const events: Event[] = (data as Event[]) ?? [];

  // Map events to include available count
  const eventsWithAvailable = ((events as EventWithTicketCount[]) ?? []).map(
    (event) => ({
      ...event,
      available: event.total_supply - (event.tickets[0]?.count ?? 0),
    }),
  );

  // ── Render ──
  return (
    <div className="section-container py-12 md:py-24">
      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary">
          Browse <span className="gradient-text">Events</span>{" "}
          {/* violet→cyan gradient on "Events" */}
        </h1>
        <p className="mt-2 text-text-secondary">
          {/* Show how many events we found — helpful for users */}
          {events.length > 0
            ? `${events.length} active event${
                events.length !== 1 ? "s" : ""
              } available`
            : "No events available right now — check back soon."}
        </p>
      </div>
      {/* ── Layout: filters sidebar + event grid ── */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile: filters chips shown above the grid */}
        {/* Desktop: hidden here — rendered in sidebar below */}
        <div className="lg:hidden">
          <EventFilters />
        </div>

        {/* Desktop sidebar: sticky filters on the left */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            {/* stays visible while user scrolls */}
            <EventFilters />
          </div>
        </aside>

        {/* Main content: the event cards grid */}
        <div className="flex-1 min-w-0">
          {/* min-w-0 prevents grid overflow */}
          {/* Pass real events from Supabase — no longer empty array */}
          <EventGrid events={eventsWithAvailable} isLoading={false} />
        </div>
      </div>
    </div>
  );
}
