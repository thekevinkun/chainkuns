import type { Metadata } from "next";
import EventForm from "@/components/events/EventForm";

export const metadata: Metadata = {
  title: "Create Event — Chainkuns",
  robots: { index: false, follow: false }, // organizer pages not indexed
};

export default function CreateEventPage() {
  return (
    <main className="section-container mx-auto py-24">
      <EventForm />
    </main>
  );
}
