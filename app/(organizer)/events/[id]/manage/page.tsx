import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

import { EventManage } from "@/components/events";

import type { Ticket, EventStatus } from "@/types";
import { createClient } from "@/lib/supabase/server";

// ── Dynamic metadata per event ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch just the title for metadata
  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: event ? `Manage ${event.title}` : "Manage Event",
    robots: { index: false, follow: false }, // organizer pages not indexed
  };
}

export default async function ManageEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // get event ID from URL
  const session = await auth(); // get current session
  const supabase = await createClient();

  // ── GET user from Supabase ──
  const { data: user } = await supabase
    .from("users")
    .select("id") // we only need the ID
    .eq("wallet_address", session?.user?.address ?? "")
    .single();

  // ── GET organizer profile ──
  const { data: organizer } = await supabase
    .from("organizer_profiles")
    .select("id") // we only need the ID
    .eq("user_id", user?.id ?? "")
    .single();

  // ── GET event — verify it belongs to this organizer ──
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      organizer_id,
      title,
      description,
      venue,
      event_date,
      total_supply,
      ticket_price_eth,
      royalty_percent,
      contract_address,
      banner_image_url,
      status,
      created_at
    `,
    )
    .eq("id", id) // target this specific event
    .eq("organizer_id", organizer?.id ?? "") // must belong to this organizer
    .single();

  // ── 404 if event not found or doesn't belong to this organizer ──
  if (!event) notFound();

  // ── GET tickets sold for this event ──
  const { data: tickets } = await supabase
    .from("tickets")
    .select(
      `
      id,
      event_id,
      token_id,
      owner_wallet,
      is_used,
      mint_tx_hash,
      idempotency_key,
      created_at
    `,
    )
    .eq("event_id", event.id) // only tickets for this event
    .order("token_id", { ascending: true }); // sort by token ID

  return (
    <EventManage
      event={{ ...event, status: event.status as EventStatus | null }}
      tickets={(tickets ?? []) as Ticket[]}
    />
  );
}
