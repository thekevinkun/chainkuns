import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TicketCard } from "@/components/tickets";
import type { Ticket, Event } from "@/types";
import { createClient } from "@/lib/supabase/server";

// Row type returned by Supabase join — events is a nested object
type TicketWithEvent = Omit<Ticket, "event"> & {
  event: Event | null; // joined from events table
};

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
  const typedTickets = (tickets ?? []) as TicketWithEvent[];

  return (
    <main className="section-container py-24 flex flex-col gap-10">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="section-heading text-text-primary">My Tickets</h1>
        <p className="text-text-secondary">
          {typedTickets.length > 0
            ? `${typedTickets.length} ticket${
                typedTickets.length === 1 ? "" : "s"
              } in your wallet`
            : "No tickets yet"}
        </p>
      </div>

      {/* Empty state */}
      {typedTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <span className="text-6xl">🎟</span>
          <h3 className="font-display font-bold text-text-primary text-xl">
            No tickets yet
          </h3>
          <p className="text-text-secondary text-sm max-w-xs">
            Browse upcoming events and mint your first NFT ticket.
          </p>
          <a href="/events" className="btn-primary mt-2">
            Browse Events
          </a>
        </div>
      )}

      {/* Tickets grid */}
      {typedTickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {typedTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket as Ticket} // cast — event field matches our Ticket type
            />
          ))}
        </div>
      )}
    </main>
  );
}
