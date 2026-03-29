import type { Metadata } from "next";
import { Marketplace } from "@/components/marketplace";

// Never cache this page
export const dynamic = "force-dynamic";

// SEO metadata for this page
export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse peer-to-peer resale tickets for all events on Chainkuns.",
};

// MarketplacePage
export default function MarketplacePage() {
  return <Marketplace />;
}
