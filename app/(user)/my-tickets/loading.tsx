import { TicketCardSkeleton } from "@/components/ui/Skeleton";

export default function MyTicketsLoading() {
  return (
    <main className="min-h-screen">
      {/* Matches MyTickets page header */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-20 rounded skeleton" />
            <div className="h-10 w-48 rounded skeleton" />
            <div className="h-4 w-80 rounded skeleton" />
          </div>
        </div>
      </section>

      {/* Ticket grid skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
