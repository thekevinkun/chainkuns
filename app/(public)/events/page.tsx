import type { Metadata } from "next";
import { BrowseEvents } from "@/components/events";
import type { Event, EventWithAvailable, EventWithTicketCount } from "@/types";
import { createClient } from "@/lib/supabase/server";

// Never cache this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Events",
  description:
    "Discover upcoming events and buy tickets as NFTs. Verified organizers, automatic royalties, zero fraud.",
};

interface EventsPageProps {
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  // Await search params — required in Next.js 15+
  const { sort, minPrice, maxPrice } = await searchParams;

  const supabase = await createClient();

  // Start building the query
  let query = supabase
    .from("events")
    .select("*, tickets(count)")
    .eq("status", "active")
    .limit(50);

  // Apply price range filters if provided
  if (minPrice && !isNaN(parseFloat(minPrice))) {
    query = query.gte("ticket_price_eth", parseFloat(minPrice));
  }
  if (maxPrice && !isNaN(parseFloat(maxPrice))) {
    query = query.lte("ticket_price_eth", parseFloat(maxPrice));
  }

  // Apply sort — default to soonest first
  switch (sort) {
    case "date_desc":
      query = query.order("event_date", { ascending: false });
      break;
    case "price_asc":
      query = query.order("ticket_price_eth", { ascending: true });
      break;
    case "price_desc":
      query = query.order("ticket_price_eth", { ascending: false });
      break;
    default:
      // date_asc is the default
      query = query.order("event_date", { ascending: true });
  }

  const { data, error } = await query;

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
