"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"; // on-chain interaction
import { parseEther } from "viem"; // convert ETH string to wei bigint
import { recordBuy } from "@/app/actions/listing"; // Server Action to sync Supabase

import Modal from "@/components/ui/Modal";
import { TransactionStatus } from "@/components/web3";

import type { Listing } from "@/types";
import { formatEth } from "@/lib/utils/format";
import { CONTRACT_ABI } from "@/lib/web3/contract"; // contract interface

interface BuyListingModalProps {
  listing: Listing;
  onClose: () => void;
}

const BuyListingModal = ({ listing, onClose }: BuyListingModalProps) => {
  const router = useRouter();

  // tracks any error message to show the user
  const [error, setError] = useState<string | null>(null);

  // tracks whether we're syncing to Supabase after the tx confirms
  const [isSyncing, setIsSyncing] = useState(false);

  // wagmi hook — calls buyTicket() on the contract
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // wagmi hook — waits for the tx to be confirmed on-chain
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      onReplaced: () => setError("Transaction was replaced. Please try again."),
    });

  // called after on-chain tx confirms — syncs Supabase
  const handleSync = async () => {
    if (!txHash) return;

    setIsSyncing(true); // show syncing state

    try {
      const result = await recordBuy({
        listing_id: listing.id,
        buy_tx_hash: txHash,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to sync purchase.");
        return;
      }

      // success — refresh the page to show updated listings
      router.refresh();
      onClose();
    } catch {
      setError("Unexpected error syncing purchase.");
    } finally {
      setIsSyncing(false);
    }
  };

  // called when user clicks "Confirm Purchase"
  const handleBuy = () => {
    setError(null); // clear previous errors

    // get the contract address from the event — never from client input
    const contractAddress = listing.ticket?.event?.contract_address as `0x${string}`;

    if (!contractAddress) {
      setError("No contract address found for this event.");
      return;
    }

    // convert price from ETH number to wei bigint for the contract
    const priceInWei = parseEther(listing.price_eth.toString());

    // call buyTicket() on the contract — MetaMask pops up
    writeContract({
      address: contractAddress,
      abi: CONTRACT_ABI,
      functionName: "buyTicket",
      args: [BigInt(listing.ticket?.token_id ?? 0)], // which token to buy
      value: priceInWei, // send exact ETH amount
    });
  };

  // trigger sync only after tx confirms — useEffect prevents calling during render
  useEffect(() => {
    if (isConfirmed && !isSyncing && !error) {
      handleSync();
    }
  }, [isConfirmed]); // only re-run when isConfirmed changes

  // determine current tx status for TransactionStatus component
  const txStatus = isPending
    ? "pending"
    : isConfirming
    ? "confirming"
    : isConfirmed
    ? "confirmed"
    : "idle";

  return (
    <Modal isOpen={true} onClose={onClose} title="Buy Ticket">
      <div className="flex flex-col gap-6">
        {/* Listing summary */}
        <div className="card-surface p-4 flex flex-col gap-2">
          <p className="text-text-secondary text-sm">Event</p>
          <p className="font-display font-bold text-text-primary">
            {listing.ticket?.event?.title ?? "Unknown Event"}
          </p>

          <p className="text-text-secondary text-sm mt-2">Ticket</p>
          <p className="font-mono text-text-primary text-sm">
            #{listing.ticket?.token_id ?? "—"}
          </p>

          <p className="text-text-secondary text-sm mt-2">Seller</p>
          <p className="font-mono text-text-primary text-sm">
            {listing.seller_wallet.slice(0, 6)}...
            {listing.seller_wallet.slice(-4)}
          </p>

          {/* Price — highlighted */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <p className="text-text-secondary text-sm">You pay</p>
            <p className="font-display font-bold text-accent-cyan text-xl">
              {formatEth(listing.price_eth)}
            </p>
          </div>
        </div>

        {/* Royalty info — transparency for the user */}
        <p className="text-text-secondary text-xs text-center">
          A royalty of {listing.ticket?.event?.royalty_percent ?? "—"}% is
          automatically sent to the organizer on every resale.
        </p>

        {/* Transaction status */}
        {txStatus !== "idle" && (
          <TransactionStatus status={txStatus} hash={txHash ?? null} />
        )}

        {/* Error message */}
        {error && <p className="text-error text-sm text-center">{error}</p>}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending || isConfirming || isSyncing}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={isPending || isConfirming || isSyncing || isConfirmed}
            className="btn-primary flex-1"
          >
            {isPending
              ? "Check Wallet..."
              : isConfirming
              ? "Confirming..."
              : isSyncing
              ? "Syncing..."
              : isConfirmed
              ? "Done!"
              : "Confirm Purchase"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BuyListingModal;
