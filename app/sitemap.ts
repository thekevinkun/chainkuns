// ============================================
// Sitemap — Chainkuns
// Tells search engines all the URLs on the site
// Static routes are hardcoded
// Dynamic event URLs are fetched from Supabase
// ============================================
import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/server"; // no cookies needed — public data

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient();

  // Fetch all active event IDs for dynamic URLs
  const { data: events } = await supabase
    .from("events")
    .select("id, created_at")
    .eq("status", "active");

  // Build dynamic event URLs — one entry per active event
  const eventUrls: MetadataRoute.Sitemap = (events ?? []).map((event) => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: event.created_at ? new Date(event.created_at) : new Date(),
    changeFrequency: "daily", // event details can change (sold out, cancelled)
    priority: 0.8, // high priority — these are the main content pages
  }));

  // Static routes — always present
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0, // homepage = highest priority
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "hourly", // new events appear here frequently
      priority: 0.9,
    },
    {
      url: `${baseUrl}/organizer/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Merge static + dynamic URLs
  return [...staticUrls, ...eventUrls];
}
