import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

import Button from "@/components/ui/Button";
import { AnalyticsCard, EventTable } from "@/components/organizer";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — Chainkuns",
  robots: { index: false, follow: false },
};

export default async function OrganizerDashboardPage() {
  const session = await auth();
  const supabase = await createClient();

  // Get user + organizer profile
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", session!.user.address)
    .single();

  const { data: profile } = await supabase
    .from("organizer_profiles")
    .select("id, display_name")
    .eq("user_id", user!.id)
    .single();

  if (!profile) redirect("/organizer/register");

  // Get their events
  const { data: events } = await supabase
    .from("events")
    .select("id, title, status, ticket_price_eth, total_supply, created_at")
    .eq("organizer_id", profile.id)
    .order("created_at", { ascending: false });

  // Get ticket purchases for their events
  const eventIds = events?.map((e) => e.id) ?? [];

  const { data: tickets } =
    eventIds.length > 0
      ? await supabase
          .from("tickets")
          .select("event_id")
          .in("event_id", eventIds)
      : { data: [] };

  // Calculate stats
  const totalEvents = events?.length ?? 0;
  const totalTicketsSold = tickets?.length ?? 0;
  const totalRevenue =
    events?.reduce((sum, e) => {
      const sold = tickets?.filter((t) => t.event_id === e.id).length ?? 0;
      return sum + sold * e.ticket_price_eth;
    }, 0) ?? 0;

  return (
    <main className="section-container mx-auto py-24 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">
            Welcome, {profile.display_name}
          </h1>
          <p className="text-muted-foreground">Here's your overview.</p>
        </div>
        <Link href="/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalyticsCard label="Total Events" value={totalEvents} />
        <AnalyticsCard label="Tickets Sold" value={totalTicketsSold} />
        <AnalyticsCard label="Total Revenue" value={totalRevenue} unit="ETH" />
      </div>

      {/* Events Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Events</h2>
        <EventTable events={events ?? []} />
      </div>
    </main>
  );
}
