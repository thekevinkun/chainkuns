import Link from "next/link";
import Button from "@/components/ui/Button";
import { AnalyticsCard, EventTable } from "@/components/organizer";
import { Event } from "@/types";

interface OrganizerDashboardProps {
  events: Event[];
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
    <main className="section-container mx-auto py-12 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Welcome, {organizerName}</h1>
          <p className="text-muted-foreground">Here's your overview.</p>
        </div>
        <Link href="/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnalyticsCard label="Total Events" value={totalEvents} />
        <AnalyticsCard label="Tickets Sold" value={totalTicketsSold} />
        <AnalyticsCard label="Total Revenue" value={totalRevenue} unit="ETH" />
      </div>

      {/* Events Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Events</h2>
        <EventTable events={events ?? []} />
      </div>
    </main>
  );
};

export default OrganizerDashboard;
