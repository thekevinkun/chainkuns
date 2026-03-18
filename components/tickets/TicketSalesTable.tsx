"use client";

import Link from "next/link";
import WalletAddress from "@/components/web3/WalletAddress";
import Badge from "@/components/ui/Badge";
import Card, { CardBody } from "@/components/ui/Card";
import type { Ticket } from "@/types";

interface TicketSalesTableProps {
  tickets: Ticket[]; // list of tickets sold for this event
}

const TicketSalesTable = ({ tickets }: TicketSalesTableProps) => {
  // ── Empty State ──
  if (tickets.length === 0) {
    return (
      <Card>
        <CardBody className="py-16 text-center space-y-2">
          {/* Empty state icon */}
          <p className="text-4xl">🎟</p>
          <p className="text-text-primary font-semibold">No tickets sold yet</p>
          <p className="text-text-secondary text-sm">
            Tickets will appear here once users start purchasing.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-text-secondary font-medium px-6 py-4">
                  Token ID
                </th>
                <th className="text-left text-text-secondary font-medium px-6 py-4">
                  Owner Wallet
                </th>
                <th className="text-left text-text-secondary font-medium px-6 py-4">
                  Minted
                </th>
                <th className="text-left text-text-secondary font-medium px-6 py-4">
                  Status
                </th>
                <th className="text-left text-text-secondary font-medium px-6 py-4">
                  TX Hash
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-border last:border-0 hover:bg-bg-elevated/50 transition-colors"
                >
                  {/* Token ID */}
                  <td className="px-6 py-4">
                    <span className="mono-text text-text-primary font-semibold">
                      #{ticket.token_id}
                    </span>
                  </td>

                  {/* Owner Wallet */}
                  <td className="px-6 py-4">
                    <WalletAddress address={ticket.owner_wallet} />
                  </td>

                  {/* Mint Date */}
                  <td className="px-6 py-4 text-text-secondary">
                    {new Date(ticket.created_at ?? "").toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </td>

                  {/* Used Status */}
                  <td className="px-6 py-4">
                    {ticket.is_used ? (
                      <Badge variant="cancelled" dot>
                        Used
                      </Badge>
                    ) : (
                      <Badge variant="active" dot>
                        Valid
                      </Badge>
                    )}
                  </td>

                  {/* TX Hash — links to Sepolia Etherscan */}
                  <td className="px-6 py-4">
                    {ticket.mint_tx_hash ? (
                      <Link
                        href={`https://sepolia.etherscan.io/tx/${ticket.mint_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono-text text-xs text-accent-cyan hover:opacity-80 transition-opacity"
                      >
                        {/* Shorten hash: 0x1234...5678 */}
                        {ticket.mint_tx_hash.slice(0, 6)}...
                        {ticket.mint_tx_hash.slice(-4)}
                      </Link>
                    ) : (
                      <span className="text-text-secondary text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default TicketSalesTable;
