import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { MyTickets } from "@/components/tickets";

import type { TicketWithEvent } from "@/types";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My Tickets",
  description: "View all your NFT event tickets",
};

export default async function MyTicketsPage() {
  // Check the user is logged in
  const session = await auth();
  if (!session?.user?.address) {
    // Not signed in — send them to home page
    redirect("/");
  }

  const supabase = await createClient();

  // Fetch all tickets owned by this wallet address
  // Join event data so we can show title, date, venue, banner
  const { data: tickets, error } = await supabase
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
    .eq("owner_wallet", session.user.address.toLowerCase()) // only this user's tickets
    .order("created_at", { ascending: false }); // newest first

  if (error) {
    console.error("[MyTicketsPage] Supabase error:", error.message);
  }

  // Cast to our typed shape — Supabase returns event as object not array
  const typedTickets = tickets ?? [];

  return <MyTickets typedTickets={typedTickets as TicketWithEvent[]} />;
}
