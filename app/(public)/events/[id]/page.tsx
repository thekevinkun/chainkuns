import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventHero } from "@/components/events";

import type { Event } from "@/types";
import { createClient } from "@/lib/supabase/server";

// Never cache this page
export const dynamic = "force-dynamic";

// ── Dynamic Metadata ──
// Generates unique OG tags per event for social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title, description, banner_image_url") // only what metadata needs
    .eq("id", id)
    .single();

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: event.title,
    description: event.description ?? "Buy NFT tickets on Chainkuns.",
    openGraph: {
      title: event.title,
      description: event.description ?? "Buy NFT tickets on Chainkuns.",
      images: event.banner_image_url
        ? [event.banner_image_url]
        : ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description ?? "Buy NFT tickets on Chainkuns.",
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
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      *,
      organizer_profiles ( display_name, logo_url )
    `,
    ) // join organizer_profiles to get real name
    .eq("id", id)
    .single();

  // Show 404 if event not found
  if (!event) notFound();

  // Count tickets sold for this event
  const { count: ticketsSold } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id);

  const available = event.total_supply - (ticketsSold ?? 0);

  // Extract organizer name and logo from the joined data
  const organizerName =
    (
      event.organizer_profiles as {
        display_name: string;
        logo_url: string | null;
      } | null
    )?.display_name ?? "Chainkuns Organizer";
  const organizerLogo =
    (
      event.organizer_profiles as {
        display_name: string;
        logo_url: string | null;
      } | null
    )?.logo_url ?? null;

  return (
    <div>
      <JsonLd event={event as Event} organizerName={organizerName} />
      <EventHero
        event={event as Event}
        organizerName={organizerName}
        organizerLogo={organizerLogo}
        available={available}
      />
    </div>
  );
}

// ── JSON-LD Structured Data ──
// Helps Google show event rich snippets in search results
function JsonLd({
  event,
  organizerName,
}: {
  event: Event;
  organizerName: string;
}) {
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
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.id}`,
    },
    organizer: {
      "@type": "Organization",
      name: organizerName,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    image:
      event.banner_image_url ??
      `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
