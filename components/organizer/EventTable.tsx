"use client";

import Link from "next/link";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

import type { Event } from "@/types/organizer";

const EventTable = ({ events }: { events: Event[] }) => {
  if (events.length === 0) {
    return (
      <Card className="p-12 text-center space-y-3">
        <p className="text-text-secondary">
          You haven't created any events yet.
        </p>
        <Link href="/events/create">
          <Button variant="secondary">Create your first event</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-text-secondary">
            <th className="text-left px-6 py-4 font-medium">Event</th>
            <th className="text-left px-6 py-4 font-medium">Status</th>
            <th className="text-left px-6 py-4 font-medium">Price</th>
            <th className="text-left px-6 py-4 font-medium">Capacity</th>
            <th className="text-left px-6 py-4 font-medium">Created</th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-b border-border last:border-0 hover:bg-bg-elevated transition-colors"
            >
              <td className="px-6 py-4 font-medium">{event.title}</td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    (event.status as "active" | "cancelled" | "soldout") ??
                    "default"
                  }
                >
                  {event.status ?? "—"}
                </Badge>
              </td>
              <td className="px-6 py-4 font-mono">
                {event.ticket_price_eth} ETH
              </td>
              <td className="px-6 py-4">{event.total_supply}</td>
              <td className="px-6 py-4 text-text-secondary">
                {event.created_at
                  ? new Date(event.created_at).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-6 py-4">
                <Link href={`/events/${event.id}/manage`}>
                  <Button size="sm" variant="ghost">
                    Manage
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default EventTable;
