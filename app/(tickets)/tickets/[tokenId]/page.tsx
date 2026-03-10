// ============================================
// Shareable Ticket Page — Chainkuns
// Public page — anyone with the URL can view it
// Shows ticket details, owner wallet, QR code
// URL: /tickets/[tokenId]
// ============================================
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Event, TicketWithEvent } from "@/types";
import { TicketDetail } from "@/components/tickets";
import { createClient } from "@/lib/supabase/server";

// ── Dynamic OG metadata ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tokenId: string }>;
}): Promise<Metadata> {
  const { tokenId } = await params; // await the params promise
  const supabase = await createClient();

  // Fetch just enough for metadata
  const { data } = await supabase
    .from("tickets")
    .select(
      "token_id, event:events ( title, venue, event_date, banner_image_url )",
    )
    .eq("token_id", parseInt(tokenId))
    .single();

  if (!data) return { title: "Ticket Not Found" };

  const event = data.event as Event | null;
  const title = `${event?.title ?? "Event"} — Ticket #${tokenId}`;
  const description = `NFT ticket #${tokenId} for ${
    event?.title ?? "an event"
  } at ${event?.venue ?? "TBA"}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ── Page ──
export default async function TicketPage({
  params,
}: {
  params: Promise<{ tokenId: string }>;
}) {
  const { tokenId } = await params; // await the params promise
  const supabase = await createClient();

  // Fetch the ticket with joined event data
  const { data: ticket } = await supabase
    .from("tickets")
    .select(
      `
      *,
      event:events (
        id,
        title,
        description,
        banner_image_url,
        venue,
        event_date,
        ticket_price_eth,
        total_supply,
        royalty_percent,
        contract_address,
        status,
        organizer_id,
        created_at
      )
    `,
    )
    .eq("token_id", parseInt(tokenId))
    .single();

  // No ticket found — show 404
  if (!ticket) notFound();

  const typed = ticket as TicketWithEvent;
  const event = typed.event;

  // ── Auth check ──
  const session = await auth();

  // Not logged in or wrong wallet → redirect to my-tickets
  if (
    !session?.user?.address ||
    session.user.address.toLowerCase() !== typed.owner_wallet.toLowerCase()
  ) {
    redirect("/my-tickets");
  }

  return <TicketDetail typed={typed} event={event} />;
}
