// ============================================
// ResaleModal Component — Chainkuns
// Lets a ticket owner list their ticket for resale
// Flow:
// 1. Owner sets a price
// 2. wagmi calls listTicket() on-chain
// 3. Wait for tx confirmation
// 4. createListing() Server Action records it in Supabase
// ============================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem"; // convert ETH string to wei bigint
import { createListing } from "@/app/actions/listing"; // Server Action

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { TransactionStatus } from "@/components/web3";

import type { Ticket } from "@/types";
import { CONTRACT_ABI } from "@/lib/web3/contract";

interface ResaleModalProps {
  ticket: Ticket;
  onClose: () => void;
}

const ResaleModal = ({ ticket, onClose }: ResaleModalProps) => {
  const router = useRouter();

  // price the seller wants to list at — stored as string for clean input behavior
  const [price, setPrice] = useState("");

  // field-level validation error
  const [priceError, setPriceError] = useState<string | null>(null);

  // general error message
  const [error, setError] = useState<string | null>(null);

  // tracks whether we're syncing to Supabase after tx confirms
  const [isSyncing, setIsSyncing] = useState(false);

  // wagmi hook — calls listTicket() on the contract
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // wagmi hook — waits for tx confirmation on-chain
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      onReplaced: () => setError("Transaction was replaced. Please try again."),
    });

  // called after on-chain tx confirms — records listing in Supabase
  const handleSync = async () => {
    if (!txHash) return;

    setIsSyncing(true);

    try {
      const result = await createListing({
        ticket_id: ticket.id,
        price_eth: parseFloat(price),
        list_tx_hash: txHash,
      });

      if (!result.success) {
        setError(result.error ?? "Failed to create listing.");
        return;
      }

      // success — refresh My Tickets page to show updated state
      router.refresh();
      onClose();
    } catch {
      setError("Unexpected error creating listing.");
    } finally {
      setIsSyncing(false);
    }
  };

  // validate price before submitting
  const validatePrice = (): boolean => {
    const parsed = parseFloat(price);

    if (!price || isNaN(parsed)) {
      setPriceError("Please enter a price.");
      return false;
    }

    if (parsed <= 0) {
      setPriceError("Price must be greater than 0.");
      return false;
    }

    if (parsed > 100) {
      setPriceError("Maximum listing price is 100 ETH.");
      return false;
    }

    setPriceError(null);
    return true;
  };

  // called when seller clicks "List for Sale"
  const handleList = () => {
    setError(null);

    // validate price first
    if (!validatePrice()) return;

    const contractAddress = ticket.event?.contract_address as `0x${string}`;

    if (!contractAddress) {
      setError("No contract address found for this ticket.");
      return;
    }

    // convert price from ETH string to wei bigint for the contract
    const priceInWei = parseEther(price);

    // call listTicket() on the contract — MetaMask pops up
    writeContract({
      address: contractAddress,
      abi: CONTRACT_ABI,
      functionName: "listTicket",
      args: [
        BigInt(ticket.token_id), // which NFT to list
        priceInWei, // price in wei
      ],
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
    <Modal isOpen={true} onClose={onClose} title="List Ticket for Resale">
      <div className="flex flex-col gap-6">
        {/* Ticket summary */}
        <div className="card-surface p-4 flex flex-col gap-2">
          <p className="text-text-secondary text-sm">Event</p>
          <p className="font-display font-bold text-text-primary">
            {ticket.event?.title ?? "Unknown Event"}
          </p>

          <p className="text-text-secondary text-sm mt-2">Ticket</p>
          <p className="font-mono text-text-primary text-sm">
            #{ticket.token_id}
          </p>
        </div>

        {/* Price input */}
        <Input
          label="Listing Price (ETH)"
          type="number"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value); // store as string — convert on submit
            setPriceError(null); // clear error on change
          }}
          placeholder="e.g. 0.08"
          error={priceError ?? undefined}
          helperText="Buyer pays this amount. Organizer royalty is deducted automatically."
          min={0}
          step={0.001}
        />

        {/* Royalty info */}
        <p className="text-text-secondary text-xs text-center">
          {ticket.event?.royalty_percent ?? "—"}% royalty is automatically sent
          to the organizer on every resale — enforced by the smart contract.
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
            onClick={handleList}
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
              : "List for Sale"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResaleModal;
