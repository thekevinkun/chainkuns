import type { Metadata } from "next";

import { BrowseEvents } from "@/components/events";

import type { Event, EventWithAvailable, EventWithTicketCount } from "@/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Browse Events",
  description:
    "Discover upcoming events and buy tickets as NFTs. Verified organizers, automatic royalties, zero fraud.",
};

export default async function EventsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*, tickets(count)")
    .eq("status", "active")
    .order("event_date", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[EventsPage] Supabase error:", error.message);
  }

  const events: Event[] = (data as Event[]) ?? [];

  const eventsWithAvailable: EventWithAvailable[] = (
    (events as EventWithTicketCount[]) ?? []
  ).map((event) => ({
    ...event,
    available: event.total_supply - (event.tickets[0]?.count ?? 0),
  }));

  return (
    <BrowseEvents
      events={eventsWithAvailable}
      totalCount={eventsWithAvailable.length}
    />
  );
}
