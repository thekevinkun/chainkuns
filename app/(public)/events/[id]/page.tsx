import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventHero from "@/components/events/EventHero";
import { MOCK_EVENT } from "@/lib/constants";
import type { Event } from "@/types";

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
      <JsonLd event={event} />
      <EventHero event={event} />
    </div>
  );
}

// ── JSON-LD Structured Data ──
// Helps Google show event rich snippets in search results
function JsonLd({ event }: { event: Event }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.event_date,
    location: {
      "@type": "Place",
      name: event.venue,
    },
    offers: {
      "@type": "Offer",
      price: event.ticket_price_eth,
      priceCurrency: "ETH",
      availability:
        event.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`,
    },
    organizer: {
      "@type": "Organization",
      name: "Chainkuns",
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    image:
      event.banner_image_url ??
      `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
