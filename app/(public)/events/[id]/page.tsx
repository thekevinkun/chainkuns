import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventHero from "@/components/events/EventHero";
import { MOCK_EVENT } from "@/lib/constants";

// ── Dynamic Metadata ──
// Generates unique OG tags per event for social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  // TODO Phase 5: fetch real event from Supabase using params.id
  const { id } = await params;
  const event = id === "1" ? MOCK_EVENT : null;

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: event.title,
    description: event.description ?? undefined,
    openGraph: {
      title: event.title,
      description: event.description ?? undefined,
      images: event.banner_image_url
        ? [event.banner_image_url]
        : ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description ?? undefined,
    },
  };
}

// ── Page Component ──
export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO Phase 5: fetch real event from Supabase
  const event = id === "1" ? MOCK_EVENT : null;

  // Show 404 if event not found
  if (!event) notFound();

  return (
    <div>
      <EventHero event={event} />
    </div>
  );
}
