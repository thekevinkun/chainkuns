"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { validateTicket } from "@/app/actions/ticket";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import { CONTRACT_ABI } from "@/lib/web3/contract";

interface QRScannerProps {
  contractAddress: `0x${string}`; // the deployed contract address for this event
}

const QRScanner = ({ contractAddress }: QRScannerProps) => {
  // ── Manual Input State ──
  const [tokenId, setTokenId] = useState(""); // token ID typed by organizer
  const [scannedToken, setScannedToken] = useState<number | null>(null); // token being validated
  const [scanError, setScanError] = useState<string | null>(null); // error message
  const [scanSuccess, setScanSuccess] = useState(false); // true when ticket validated

  // ── Contract Write — useTicket() ──
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // ── Wait for transaction to confirm ──
  const { isLoading: isConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash, // watch this transaction
    });

  // True while MetaMask is open or tx is confirming
  const isLoading = isPending || isConfirming;

  // ── Handle Submit ──
  const handleSubmit = () => {
    setScanError(null);
    setScanSuccess(false);

    // Parse and validate the token ID input
    const parsed = parseInt(tokenId);
    if (isNaN(parsed) || parsed < 0) {
      setScanError("Please enter a valid token ID.");
      return;
    }

    setScannedToken(parsed); // store for Supabase update after tx confirms

    // Call useTicket() on the contract — marks ticket as used on-chain
    writeContract({
      address: contractAddress, // which contract to write to
      abi: CONTRACT_ABI, // our EventTicket ABI
      functionName: "useTicket", // marks ticket as used on-chain
      args: [BigInt(parsed)], // token ID to mark as used
    });
  };

  // ── After contract tx confirms — update Supabase ──
  useEffect(() => {
    if (!isTxSuccess || scannedToken === null) return;

    async function markUsedInSupabase() {
      // Call server action to mark ticket as used in Supabase
      const result = await validateTicket({
        token_id: scannedToken!, // token ID we just validated
        contract_address: contractAddress, // event contract address
      });

      if (result.success) {
        setScanSuccess(true); // show success state
        setTokenId(""); // clear input for next scan
      } else {
        setScanError(result.error); // show error if Supabase update failed
      }
    }

    markUsedInSupabase();
  }, [isTxSuccess, scannedToken]);

  return (
    <Card>
      <CardBody className="space-y-5">
        {/* ── Header ── */}
        <div className="space-y-1">
          <h2 className="font-semibold text-text-primary">Ticket Validation</h2>
          <p className="text-xs text-text-secondary">
            Enter the token ID from the ticket to validate it at the door.
          </p>
        </div>

        <div className="divider my-0" />

        {/* ── Success State ── */}
        {scanSuccess && (
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="text-5xl">✅</span>
            <p className="font-semibold text-text-primary">Ticket Validated!</p>
            <p className="text-text-secondary text-sm">
              Token #{scannedToken} has been marked as used.
            </p>
            {/* Reset to validate another ticket */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setScanSuccess(false);
                setScannedToken(null);
              }}
            >
              Validate Another
            </Button>
          </div>
        )}

        {/* ── Input + Submit ── */}
        {!scanSuccess && (
          <div className="space-y-4">
            {/* Token ID input */}
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="e.g. 42"
              min={0}
              disabled={isLoading} // disable while validating
              className="input-base"
            />

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading || !tokenId}
              className="w-full"
            >
              {isLoading ? "Validating..." : "Validate Ticket"}
            </Button>
          </div>
        )}

        {/* ── Transaction Status ── */}
        {isLoading && (
          <p className="text-xs text-accent-cyan text-center">
            {isPending
              ? "Please confirm in MetaMask..." // waiting for user to sign
              : "Waiting for transaction to confirm..."}{" "}
            // waiting for block
          </p>
        )}

        {/* ── Error ── */}
        {scanError && (
          <p className="text-sm text-error text-center">{scanError}</p>
        )}
      </CardBody>
    </Card>
  );
};

export default QRScanner;
