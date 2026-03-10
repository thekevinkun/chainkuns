import type { Metadata } from "next";
import EventForm from "@/components/events/EventForm";

export const metadata: Metadata = {
  title: "Create Event",
  robots: { index: false, follow: false }, // organizer pages not indexed
};

export default function CreateEventPage() {
  return (
    <main className="section-container mx-auto py-12">
      <EventForm />
    </main>
  );
}
