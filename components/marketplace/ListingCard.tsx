"use client";

import Image from "next/image";
import { useAccount } from "wagmi"; // get connected wallet address
import { cn } from "@/lib/utils/cn";
import { formatEth } from "@/lib/utils/format";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
  onBuy: (listing: Listing) => void; // triggered when buyer clicks Buy
  onCancel: (listing: Listing) => void; // triggered when seller clicks Cancel
}

const ListingCard = ({ listing, onBuy, onCancel }: ListingCardProps) => {
  // get the connected wallet so we can show the right button
  const { address } = useAccount();

  // safely extract nested data
  const ticket = listing.ticket;
  const event = listing.ticket?.event;

  // check if the connected wallet is the seller
  const isSeller =
    address?.toLowerCase() === listing.seller_wallet.toLowerCase();

  // check if the connected wallet is the buyer (can't buy your own listing)
  const isBuyer = address && !isSeller;

  return (
    <div className="card-surface flex flex-col gap-4 p-4 hover:border-accent-cyan/30 transition-colors">
      {/* Event banner image */}
      <div className="relative w-full h-36 rounded-lg overflow-hidden bg-bg-elevated">
        {event?.banner_image_url ? (
          <Image
            src={event.banner_image_url}
            alt={event.title ?? "Event"}
            fill
            className="object-cover"
          />
        ) : (
          // fallback if no banner
          <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
            No image
          </div>
        )}

        {/* Token ID badge — top left */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white font-mono">
          #{ticket?.token_id ?? "—"}
        </div>
      </div>

      {/* Event title and venue */}
      <div className="flex flex-col gap-1">
        <h3 className="font-display font-bold text-text-primary text-sm leading-tight line-clamp-2">
          {event?.title ?? "Unknown Event"}
        </h3>
        <p className="text-text-secondary text-xs">{event?.venue ?? "—"}</p>
      </div>

      {/* Seller address */}
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-xs">Seller:</span>
        <span className="text-xs font-mono text-text-primary">
          {/* shorten the address for display */}
          {listing.seller_wallet.slice(0, 6)}...
          {listing.seller_wallet.slice(-4)}
        </span>
        {/* badge if this listing belongs to connected wallet */}
        {isSeller && (
          <span className="text-xs bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 px-1.5 py-0.5 rounded">
            You
          </span>
        )}
      </div>

      {/* Price + action button */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <span className="font-display font-bold text-accent-cyan">
          {formatEth(listing.price_eth)}
        </span>

        {/* Show Cancel if seller, Buy if someone else, nothing if not connected */}
        {isSeller ? (
          <button
            onClick={() => onCancel(listing)}
            className={cn(
              "btn-ghost text-xs px-3 py-1.5",
              "border border-error/30 text-error hover:bg-error/10",
            )}
          >
            Cancel
          </button>
        ) : isBuyer ? (
          <button
            onClick={() => onBuy(listing)}
            className="btn-primary text-xs px-3 py-1.5"
          >
            Buy
          </button>
        ) : (
          // not connected — show disabled buy button
          <button
            disabled
            className="btn-primary text-xs px-3 py-1.5 opacity-50 cursor-not-allowed"
          >
            Buy
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
