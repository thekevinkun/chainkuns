import Link from "next/link";
import Button from "@/components/ui/Button";
import { AnalyticsCard, EventTable } from "@/components/organizer";
import type { Event as ChainkunsEvent } from "@/types";

interface OrganizerDashboardProps {
  events: ChainkunsEvent[];
  organizerName: string;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

const OrganizerDashboard = ({
  events,
  organizerName,
  totalEvents,
  totalTicketsSold,
  totalRevenue,
}: OrganizerDashboardProps) => {
  return (
    <main className="min-h-screen">
      {/* Page header */}
      <section className="border-b border-border bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex flex-col gap-3">
              {/* Badge */}
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">
                Organizer Dashboard
              </span>

              <h1 className="section-heading text-text-primary">
                Welcome, {organizerName}
              </h1>

              <p className="text-text-secondary max-w-xl">
                Manage your events, track ticket sales, and monitor your revenue
                — all in one place.
              </p>
            </div>

            {/* Create Event button — moved into header */}
            <Link href="/events/create">
              <Button>Create Event</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AnalyticsCard label="Total Events" value={totalEvents} />
          <AnalyticsCard label="Tickets Sold" value={totalTicketsSold} />
          <AnalyticsCard
            label="Total Revenue"
            value={totalRevenue}
            unit="ETH"
          />
        </div>

        {/* Events Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Your Events
          </h2>
          <EventTable events={events ?? []} />
        </div>
      </section>
    </main>
  );
};

export default OrganizerDashboard;
