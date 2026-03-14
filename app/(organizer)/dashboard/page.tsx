import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OrganizerDashboard } from "@/components/organizer";

import { Event } from "@/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
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
    .select("*")
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

  // Get sold resale listings for this organizer's events
  // Used to calculate royalty revenue
  const { data: soldListings } =
    eventIds.length > 0
      ? await supabase
          .from("listings")
          .select(
            `
            price_eth,
            ticket:tickets!inner (
              event:events!inner (
                id,
                royalty_percent
              )
            )
          `,
          )
          .eq("status", "sold") // only completed sales
          .in("ticket.event_id", eventIds) // only for this organizer's events
      : { data: [] };

  // Calculate stats
  const totalEvents = events?.length ?? 0;
  const totalTicketsSold = tickets?.length ?? 0;

  // Mint revenue — tickets sold × ticket price per event
  const mintRevenue =
    events?.reduce((sum, event) => {
      const sold = tickets?.filter((t) => t.event_id === event.id).length ?? 0;
      return sum + sold * Number(event.ticket_price_eth);
    }, 0) ?? 0;

  // Royalty revenue — organizer earns royalty_percent % on every resale
  const royaltyRevenue =
    soldListings?.reduce((sum, listing) => {
      const royaltyPercent =
        Number(
          (
            listing.ticket as unknown as {
              event: { royalty_percent: number };
            }
          )?.event?.royalty_percent,
        ) ?? 0;
      return sum + Number(listing.price_eth) * (royaltyPercent / 100);
    }, 0) ?? 0;

  // Total = mint revenue + royalty revenue from resales
  const totalRevenue = mintRevenue + royaltyRevenue;

  return (
    <OrganizerDashboard
      events={(events ?? []) as Event[]}
      organizerName={profile.display_name}
      totalEvents={totalEvents}
      totalRevenue={totalRevenue}
      totalTicketsSold={totalTicketsSold}
    />
  );
}
