import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventResale } from "@/components/events";
import type { Event } from "@/types";
import { createServiceClient } from "@/lib/supabase/server";

interface PageProps {
  params: { id: string };
}

// generateMetadata
// Dynamic SEO metadata per event
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("id", id)
    .single();

  if (!event) {
    return { title: "Event Not Found — Chainkuns" };
  }

  return {
    title: `Resale Tickets — ${event.title} | Chainkuns`,
    description: `Browse peer-to-peer resale tickets for ${event.title} on Chainkuns.`,
  };
}

// EventResalePage
export default async function EventResalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  // fetch the event to show its info in the header
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("status", "active") // only show active events
    .single();

  // if event doesn't exist or isn't active — 404
  if (!event) notFound();

  const typedEvent = event as unknown as Event;

  return <EventResale typedEvent={typedEvent} eventId={id} />;
}
