import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

import { TicketDetail } from "@/components/tickets";

import type { Event, TicketWithEvent } from "@/types";
import { createClient } from "@/lib/supabase/server";

async function getTicketByAssetIdentity(
  contractAddress: string,
  tokenId: number,
): Promise<TicketWithEvent | null> {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      `
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
    `,
    )
    .ilike("contract_address", contractAddress)
    .single();

  if (!event) return null;

  const { data: ticket } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", event.id)
    .eq("token_id", tokenId)
    .single();

  if (!ticket) return null;

  return {
    ...ticket,
    event: event as Event,
  } as TicketWithEvent;
}

// ── Dynamic OG metadata ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ contractAddress: string; tokenId: string }>;
}): Promise<Metadata> {
  const { contractAddress, tokenId } = await params;
  const parsedTokenId = Number(tokenId);

  if (!Number.isInteger(parsedTokenId) || parsedTokenId < 0) {
    return { title: "Ticket Not Found" };
  }

  const ticket = await getTicketByAssetIdentity(contractAddress, parsedTokenId);
  if (!ticket) return { title: "Ticket Not Found" };

  const event = ticket.event;
  const title = `${event?.title ?? "Event"} — Ticket #${ticket.token_id}`;
  const description = `NFT ticket #${ticket.token_id} for ${
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
  params: Promise<{ contractAddress: string; tokenId: string }>;
}) {
  const { contractAddress, tokenId } = await params;
  const parsedTokenId = Number(tokenId);

  if (!Number.isInteger(parsedTokenId) || parsedTokenId < 0) {
    notFound();
  }

  const ticket = await getTicketByAssetIdentity(contractAddress, parsedTokenId);

  if (!ticket || !ticket.event) notFound();

  const canonicalContractAddress = ticket.event.contract_address;
  if (
    canonicalContractAddress &&
    contractAddress.toLowerCase() !== canonicalContractAddress.toLowerCase()
  ) {
    redirect(`/tickets/${canonicalContractAddress}/${ticket.token_id}`);
  }

  // ── Auth check ──
  const session = await auth();

  // Not logged in or wrong wallet → redirect to my-tickets
  if (
    !session?.user?.address ||
    session.user.address.toLowerCase() !== ticket.owner_wallet.toLowerCase()
  ) {
    redirect("/my-tickets");
  }

  return <TicketDetail typed={ticket} event={ticket.event} />;
}
