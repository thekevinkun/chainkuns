"use client";

import { formatEth } from "@/lib/utils/format";
import type { Listing } from "@/types";

interface PriceHistoryProps {
  history: Listing[]; // list of sold listings for this ticket
}

const PriceHistory = ({ history }: PriceHistoryProps) => {
  // empty state — no sales history yet
  if (history.length === 0) {
    return (
      <div className="card-surface p-4 flex flex-col gap-2">
        <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
          Price History
        </h3>
        <p className="text-text-secondary text-sm">No sales history yet.</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-4 flex flex-col gap-4">
      <h3 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider">
        Price History
      </h3>

      {/* Table header */}
      <div className="grid grid-cols-3 gap-2 text-xs text-text-secondary uppercase tracking-wider pb-2 border-b border-border">
        <span>Price</span>
        <span>Seller</span>
        <span>Date</span>
      </div>

      {/* Sales rows */}
      <div className="flex flex-col gap-3">
        {history.map((sale) => (
          <div
            key={sale.id}
            className="grid grid-cols-3 gap-2 text-sm items-center"
          >
            {/* Sale price */}
            <span className="font-display font-bold text-accent-cyan">
              {formatEth(sale.price_eth)}
            </span>

            {/* Seller address — shortened */}
            <span className="font-mono text-text-secondary text-xs">
              {sale.seller_wallet.slice(0, 6)}...{sale.seller_wallet.slice(-4)}
            </span>

            {/* Sale date */}
            <span className="text-text-secondary text-xs">
              {new Date(sale.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceHistory;
