// ============================================
// TicketPurchaseCard Component
// The sticky buy card on the event detail page
// Handles the full ticket purchase flow:
// 1. Check wallet connected + session
// 2. Generate idempotency key
// 3. Call mintTicket() on the contract via wagmi
// 4. Use useOptimistic to show ticket immediately
// 5. Save to Supabase via recordMint() Server Action
// ============================================
"use client"; // needs wagmi hooks + session — must be client component

import {
  useState,
  useEffect,
  useRef,
  useOptimistic,
  useTransition,
} from "react";
import Link from "next/link";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"; // wagmi 2.x hooks
import { decodeEventLog } from "viem"; // decodes blockchain event logs
import { parseEther } from "viem"; // converts ETH string to wei bigint
import { useSession } from "next-auth/react"; // NextAuth session
import { recordMint, checkMintRateLimit } from "@/app/actions/ticket"; // Server Action to save to Supabase
import { uploadTicketMetadata } from "@/app/actions/ipfs"; // Server Action to upload metadata to IPFS and get URI back

import Button from "@/components/ui/Button";

import type { Event } from "@/types"; // shared Event type
import { CONTRACT_ABI } from "@/lib/web3/contract"; // contract ABI from Phase 1

// Props this component receives from EventHero
interface TicketPurchaseCardProps {
  event: Event; // the event being purchased
  available: number; // tickets available (total_supply - sold) for display purposes
}

const TicketPurchaseCard = ({ event, available }: TicketPurchaseCardProps) => {
  const { address, isConnected } = useAccount(); // current wallet state
  const { data: session } = useSession(); // NextAuth session
  const [txError, setTxError] = useState<string | null>(null); // error message to show user
  const [isSaving, setIsSaving] = useState(false); // true while saving to Supabase

  const idempotencyKeyRef = useRef<string>(""); // persists the key across renders
  const metadataUriRef = useRef<string>(""); // persists the IPFS URI across renders for use in handleConfirmed

  // useOptimistic — React 19 hook
  // Shows "Ticket Minted!" immediately while we wait for blockchain + Supabase
  // If something fails, it reverts back to false automatically
  const [optimisticMinted, setOptimisticMinted] = useOptimistic(false);

  // useTransition — React 18 hook
  // Manages the async state of the purchase flow (pending, confirmed)
  // We use this to disable the button and show different labels during each phase
  const [isPendingTransition, startTransition] = useTransition();

  // wagmi hook — calls a write function on the contract
  // writeContract() triggers MetaMask popup
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // wagmi hook — polls the blockchain until the tx is confirmed
  // Get receipt from wagmi — it contains the logs we need
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash, // watch this specific tx hash
  });

  // Generate a unique idempotency key before each purchase attempt
  // Format: mint-{walletAddress}-{eventId}-{timestamp}
  // If the page crashes and user retries, same key = no double mint
  const generateIdempotencyKey = () =>
    `mint-${address?.toLowerCase()}-${event.id}-${Date.now()}`;

  // Called when user clicks "Buy Ticket"
  const handleBuy = async () => {
    setTxError(null);

    if (!isConnected || !address) {
      setTxError("Please connect your wallet first.");
      return;
    }
    if (!session?.user?.address) {
      setTxError("Please sign in with your wallet first.");
      return;
    }
    if (!event.contract_address) {
      setTxError("This event has no deployed contract yet.");
      return;
    }

    // ── PRE-CHECK rate limit BEFORE any expensive operations ──
    const rateLimitCheck = await checkMintRateLimit();
    if (!rateLimitCheck.success) {
      setTxError(rateLimitCheck.error ?? "Rate limit exceeded.");
      return; // stop here — nothing has happened yet
    }

    // Store idempotency key for later use in handleConfirmed
    idempotencyKeyRef.current = generateIdempotencyKey();

    // Step 1 — upload metadata to IPFS
    // We use a temporary token ID here — Alchemy webhook will record the real one
    const { uri, error: ipfsError } = await uploadTicketMetadata({
      eventTitle: event.title,
      eventDate: event.event_date,
      venue: event.venue ?? "TBA",
      ticketPriceEth: event.ticket_price_eth.toString(),
      tokenId: 0, // use 0 as placeholder — real ID assigned by contract
      contractAddress: event.contract_address,
      bannerImageUrl: event.banner_image_url,
    });

    if (ipfsError || !uri) {
      setTxError("Failed to upload ticket metadata. Please try again.");
      return;
    }

    // Save URI for use in handleConfirmed
    metadataUriRef.current = uri;

    // Step 2 — mint with the real IPFS URI
    startTransition(() => {
      setOptimisticMinted(true);
    });

    try {
      writeContract({
        address: event.contract_address as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "mintTicket",
        args: [address as `0x${string}`, uri],
        value: parseEther(event.ticket_price_eth.toString()),
      });
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Transaction failed.");
      startTransition(() => setOptimisticMinted(false));
    }
  };

  // Save to Supabase once blockchain confirms the tx
  // This runs when useWaitForTransactionReceipt reports isConfirmed = true
  const handleConfirmed = async (receipt: { logs: unknown[] }) => {
    if (!txHash || !address || isSaving) return;
    setIsSaving(true);

    // Decode the Transfer event log to get the real tokenId
    // ERC-721 Transfer event: Transfer(address from, address to, uint256 tokenId)
    let realTokenId = 0;

    try {
      for (const log of receipt.logs as {
        topics: string[];
        data: string;
        address: string;
      }[]) {
        try {
          const decoded = decodeEventLog({
            abi: [
              {
                type: "event",
                name: "Transfer",
                inputs: [
                  { name: "from", type: "address", indexed: true },
                  { name: "to", type: "address", indexed: true },
                  { name: "tokenId", type: "uint256", indexed: true },
                ],
              },
            ],
            topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
            data: log.data as `0x${string}`,
          });

          // Found the Transfer event — extract the real tokenId
          realTokenId = Number((decoded.args as { tokenId: bigint }).tokenId);
          break;
        } catch {
          // This log isn't a Transfer event — skip it
          continue;
        }
      }
    } catch {
      console.warn(
        "[TicketPurchaseCard] Could not decode tokenId from receipt",
      );
    }

    // Now save to Supabase with the REAL tokenId
    const result = await recordMint({
      eventId: event.id,
      tokenId: realTokenId, // real tokenId from blockchain
      txHash: txHash,
      idempotencyKey: idempotencyKeyRef.current,
    });

    if (!result.success) {
      console.error("[TicketPurchaseCard] recordMint failed:", result.error);
    }

    setIsSaving(false);
  };

  useEffect(() => {
    if (isConfirmed && txHash && receipt) {
      handleConfirmed(receipt); // pass receipt so we can decode tokenId
    }
  }, [isConfirmed, txHash, receipt]);

  // ── Button state logic ──
  // Determine what the button should say and whether it's disabled
  const getButtonState = (): { label: string; disabled: boolean } => {
    if (!isConnected || !session)
      return { label: "Connect Wallet to Buy", disabled: true };
    if (isPending) return { label: "Confirm in MetaMask...", disabled: true };
    if (isConfirming)
      return { label: "Confirming on chain...", disabled: true };
    if (optimisticMinted || isConfirmed)
      return { label: "🎟 Ticket Minted!", disabled: true };
    if (available <= 0) return { label: "Sold Out", disabled: true };
    if (isSaving) return { label: "Saving...", disabled: true };
    return {
      label: `Buy Ticket — ${event.ticket_price_eth} ETH`,
      disabled: false,
    };
  };

  const { label, disabled } = getButtonState();

  // ── Render ──
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
          <span className="text-text-secondary text-sm">Available</span>
          <span className="text-text-primary font-semibold mono-text text-sm">
            {available} / {event.total_supply}
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
          <Link
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
          </Link>
        </div>
      </div>

      <div className="divider my-0" />

      {/* Buy button */}
      <Button disabled={disabled} onClick={handleBuy}>
        {label}
      </Button>

      {/* Error message */}
      {txError && <p className="text-error text-xs text-center">{txError}</p>}

      {/* Success tx link */}
      {isConfirmed && txHash && (
        <Link
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary text-xs text-center hover:opacity-80 transition-opacity"
        >
          View transaction ↗
        </Link>
      )}

      {/* NFT info */}
      <p className="text-text-secondary text-xs text-center leading-relaxed">
        Your ticket will be minted as an NFT directly to your wallet on Ethereum
        Sepolia.
      </p>
    </div>
  );
};

export default TicketPurchaseCard;
