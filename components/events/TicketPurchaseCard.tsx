import type { Event } from "@/types";

const TicketPurchaseCard = ({ event }: { event: Event }) => {
  return (
    <div className="card-elevated p-6 flex flex-col gap-5 sticky top-24">
      {/* Price */}
      <div>
        <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">
          Ticket Price
        </p>
        <p className="font-display font-bold text-3xl mono-text">
          {event.ticket_price_eth} ETH
        </p>
      </div>

      <div className="divider my-0" />

      {/* Supply info */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">Total Supply</span>
          <span className="text-text-primary font-semibold mono-text text-sm">
            {event.total_supply}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">Royalty on Resale</span>
          <span className="text-text-primary font-semibold mono-text text-sm">
            {event.royalty_percent}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">Contract</span>
          <a
            href={`https://sepolia.etherscan.io/address/${event.contract_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-text text-xs hover:opacity-80 transition-opacity"
          >
            {event.contract_address
              ? `${event.contract_address.slice(
                  0,
                  6,
                )}...${event.contract_address.slice(-4)}`
              : "Not deployed"}
          </a>
        </div>
      </div>

      <div className="divider my-0" />

      {/* Buy button — TODO Phase 5: wire to contract */}
      <button className="btn-primary w-full" disabled>
        Connect Wallet to Buy
      </button>

      {/* NFT info */}
      <p className="text-text-secondary text-xs text-center leading-relaxed">
        Your ticket will be minted as an NFT directly to your wallet on Ethereum
        Sepolia.
      </p>
    </div>
  );
};
export default TicketPurchaseCard;
