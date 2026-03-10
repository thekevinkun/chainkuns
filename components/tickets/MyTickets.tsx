import { TicketCard } from "@/components/tickets";
import { Ticket, TicketWithEvent } from "@/types";

const MyTickets = ({ typedTickets }: { typedTickets: TicketWithEvent[] }) => {
  return (
    <main className="section-container py-12 flex flex-col gap-10">
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
};

export default MyTickets;
