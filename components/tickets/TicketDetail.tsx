import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { getPriceHistory } from "@/app/actions/listing"; // fetch sold listings

import { PriceHistory } from "@/components/marketplace";
import TicketQR from "@/components/tickets/TicketQR";

import type { Event, TicketWithEvent } from "@/types";
import { getTxUrl, formatEventDate, ipfsToHttp } from "@/lib/utils/format";

interface TicketDetailProps {
  typed: TicketWithEvent;
  event: Event | null;
}

const TicketDetail = async ({ typed, event }: TicketDetailProps) => {
  // Data to encode in the QR code — scanned at the door by organizer
  const qrData = JSON.stringify({
    tokenId: typed.token_id,
    contractAddress: event?.contract_address ?? "",
  });

  // fetch price history for this ticket — sold listings only
  const priceHistoryResult = await getPriceHistory(typed.id);
  const priceHistory = priceHistoryResult.data ?? [];

  return (
    <main className="section-container py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        {/* Banner image */}
        <div
          className="relative w-full h-56 rounded-2xl overflow-hidden 
            bg-gradient-to-br from-accent-violet/30 to-accent-cyan/20"
        >
          {event?.banner_image_url ? (
            <Image
              src={ipfsToHttp(event.banner_image_url)}
              alt={event?.title ?? "Event"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🎟
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-4 right-4">
            <Badge variant={typed.is_used ? "cancelled" : "active"} className="bg-bg-base/30 backdrop-blur-sm" dot>
              {typed.is_used ? "Used" : "Valid"}
            </Badge>
          </div>
        </div>

        {/* Main content card */}
        <div className="card-elevated p-8 flex flex-col gap-6">
          {/* Token ID + title */}
          <div className="flex flex-col gap-1">
            <p className="mono-text text-sm">Ticket #{typed.token_id}</p>
            <h1 className="font-display font-bold text-text-primary text-2xl leading-snug">
              {event?.title ?? "Unknown Event"}
            </h1>
          </div>

          <div className="divider my-0" />

          {/* Event details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {event?.event_date && (
              <div className="flex flex-col gap-1">
                <p className="text-text-secondary text-xs uppercase tracking-wider">
                  Date & Time
                </p>
                <p className="text-text-primary text-sm font-semibold">
                  {formatEventDate(event.event_date)}
                </p>
              </div>
            )}

            {event?.venue && (
              <div className="flex flex-col gap-1">
                <p className="text-text-secondary text-xs uppercase tracking-wider">
                  Venue
                </p>
                <p className="text-text-primary text-sm font-semibold">
                  {event.venue}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <p className="text-text-secondary text-xs uppercase tracking-wider">
                Owner Wallet
              </p>
              <p className="mono-text text-sm">
                {typed.owner_wallet.slice(0, 6)}...
                {typed.owner_wallet.slice(-4)}
              </p>
            </div>

            {event?.contract_address && (
              <div className="flex flex-col gap-1">
                <p className="text-text-secondary text-xs uppercase tracking-wider">
                  Contract
                </p>
                <Link
                  href={`https://sepolia.etherscan.io/address/${event.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono-text text-sm hover:opacity-80 transition-opacity"
                >
                  {event.contract_address.slice(0, 6)}...
                  {event.contract_address.slice(-4)} ↗
                </Link>
              </div>
            )}
          </div>

          <div className="divider my-0" />

          {/* QR Code — scanned at the door */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-text-secondary text-xs uppercase tracking-wider">
              Scan at Door
            </p>
            <div className="bg-white p-4 rounded-2xl">
              <TicketQR value={qrData} size={180} level="H" />
            </div>
            <p className="text-text-secondary text-xs text-center max-w-sm">
              Show this QR code at the entrance. Do not share with others.
            </p>
          </div>

          <div className="divider my-0" />

          {/* Transaction link */}
          {typed.mint_tx_hash && (
            <Link
              href={getTxUrl(typed.mint_tx_hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost w-full text-center text-sm"
            >
              View Mint Transaction ↗
            </Link>
          )}
        </div>

        {/* Price history — shows all past resales for this ticket */}
        <PriceHistory history={priceHistory} />
      </div>
    </main>
  );
};

export default TicketDetail;
