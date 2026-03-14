"use client";

import { useState } from "react";
import {
  ListingCard,
  BuyListingModal,
  CancelListingModal,
} from "@/components/marketplace";
import type { Listing } from "@/types";

interface ListingGridProps {
  listings: Listing[];
}

const ListingGrid = ({ listings }: ListingGridProps) => {
  // track which listing the user wants to buy
  const [buyListing, setBuyListing] = useState<Listing | null>(null);

  // track which listing the user wants to cancel
  const [cancelListing, setCancelListing] = useState<Listing | null>(null);

  // empty state — no active listings
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-5xl">🎟</span>
        <p className="text-text-secondary text-center">
          No listings yet. Be the first to list a ticket for resale!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Responsive grid — 1 col mobile, 2 tablet, 3 desktop, 4 wide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onBuy={(l) => setBuyListing(l)} // open buy modal
            onCancel={(l) => setCancelListing(l)} // open cancel modal
          />
        ))}
      </div>

      {/* Buy modal — only renders when a listing is selected */}
      {buyListing && (
        <BuyListingModal
          listing={buyListing}
          onClose={() => setBuyListing(null)} // close modal
        />
      )}

      {/* Cancel modal — only renders when a listing is selected */}
      {cancelListing && (
        <CancelListingModal
          listing={cancelListing}
          onClose={() => setCancelListing(null)} // close modal
        />
      )}
    </>
  );
};

export default ListingGrid;
