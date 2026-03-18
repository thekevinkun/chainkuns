import { TicketCard } from "@/components/tickets";
import type { Ticket, TicketWithEvent } from "@/types";

const MyTickets = ({ typedTickets }: { typedTickets: TicketWithEvent[] }) => {
  return (
    <main className="min-h-screen">
      {/* Page header — same style as marketplace */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-3">
            {/* Badge */}
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">
              My Tickets
            </span>

            <h1 className="section-heading text-text-primary">
              Your NFT Tickets
            </h1>

            <p className="text-text-secondary max-w-xl">
              {typedTickets.length > 0
                ? `${typedTickets.length} ticket${
                    typedTickets.length === 1 ? "" : "s"
                  } in your wallet — each one is a unique NFT on the blockchain.`
                : "You don't have any tickets yet. Browse events and mint your first NFT ticket."}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                ticket={ticket as Ticket}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default MyTickets;