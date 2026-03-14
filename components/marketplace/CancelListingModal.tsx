"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { cancelListing } from "@/app/actions/listing"; // Server Action to sync Supabase

import Modal from "@/components/ui/Modal";
import { TransactionStatus } from "@/components/web3";

import type { Listing } from "@/types";
import { formatEth } from "@/lib/utils/format";
import { CONTRACT_ABI } from "@/lib/web3/contract";

interface CancelListingModalProps {
  listing: Listing;
  onClose: () => void;
}

const CancelListingModal = ({ listing, onClose }: CancelListingModalProps) => {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // wagmi hook — calls cancelListing() on the contract
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // wagmi hook — waits for tx confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      onReplaced: () => setError("Transaction was replaced. Please try again."),
    });

  // called after on-chain tx confirms — syncs Supabase
  const handleSync = async () => {
    if (!txHash) return;

    setIsSyncing(true);

    try {
      const result = await cancelListing({
        listing_id: listing.id,
        cancel_tx_hash: txHash,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to sync cancellation.");
        return;
      }

      // success — refresh page to remove the listing from the grid
      router.refresh();
      onClose();
    } catch {
      setError("Unexpected error syncing cancellation.");
    } finally {
      setIsSyncing(false);
    }
  };

  // called when seller clicks "Confirm Cancel"
  const handleCancel = () => {
    setError(null);

    const contractAddress = listing.ticket?.event?.contract_address as `0x${string}`;

    if (!contractAddress) {
      setError("No contract address found for this event.");
      return;
    }

    // call cancelListing() on the contract — MetaMask pops up
    writeContract({
      address: contractAddress,
      abi: CONTRACT_ABI,
      functionName: "cancelListing",
      args: [BigInt(listing.ticket?.token_id ?? 0)], // which token to cancel
    });
  };

  // trigger sync only after tx confirms — useEffect prevents calling during render
  useEffect(() => {
    if (isConfirmed && !isSyncing && !error) {
      handleSync();
    }
  }, [isConfirmed]); // only re-run when isConfirmed changes

  const txStatus = isPending
    ? "pending"
    : isConfirming
    ? "confirming"
    : isConfirmed
    ? "confirmed"
    : "idle";

  return (
    <Modal isOpen={true} onClose={onClose} title="Cancel Listing">
      <div className="flex flex-col gap-6">
        {/* Warning message */}
        <div className="bg-error/10 border border-error/30 rounded-lg p-4">
          <p className="text-error text-sm text-center">
            This will remove your ticket from the marketplace on-chain. You can
            re-list it at any time.
          </p>
        </div>

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

          {/* Current listing price */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <p className="text-text-secondary text-sm">Listed at</p>
            <p className="font-display font-bold text-text-primary text-xl">
              {formatEth(listing.price_eth)}
            </p>
          </div>
        </div>

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
            Keep Listing
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending || isConfirming || isSyncing || isConfirmed}
            className="border border-error/30 text-error hover:bg-error/10 transition-colors rounded-lg px-4 py-2 flex-1 font-semibold text-sm"
          >
            {isPending
              ? "Check Wallet..."
              : isConfirming
              ? "Confirming..."
              : isSyncing
              ? "Syncing..."
              : isConfirmed
              ? "Done!"
              : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelListingModal;
