// ============================================
// Sitemap — app/sitemap.ts
// Tells search engines which pages exist
// TODO Phase 5: add dynamic event URLs from Supabase
// ============================================

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return [
    // Landing page
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Browse events
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "hourly", // events change frequently
      priority: 0.9,
    },
    // Marketplace
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];
}
