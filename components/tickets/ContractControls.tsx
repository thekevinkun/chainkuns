"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card, { CardBody } from "@/components/ui/Card";
import { CONTRACT_ABI } from "@/lib/web3/contract";

interface ContractControlsProps {
  contractAddress: `0x${string}`; // the deployed contract address for this event
}

const ContractControls = ({ contractAddress }: ContractControlsProps) => {
  // ── Read contract state — is it paused? ──
  const { data: isPaused, refetch } = useReadContract({
    address: contractAddress, // which contract to read from
    abi: CONTRACT_ABI, // our EventTicket ABI
    functionName: "paused", // reads the paused() state from contract
  });

  // ── Write contract — pause or unpause ──
  const { writeContract, data: txHash, isPending } = useWriteContract();

  // ── Wait for transaction to confirm ──
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash, // watch this transaction
    onReplaced: () => refetch(), // refetch paused state if tx replaced
  });

  // True while MetaMask is open or tx is confirming
  const isLoading = isPending || isConfirming;

  // Handles pause button click
  const handlePause = () => {
    writeContract({
      address: contractAddress, // which contract to write to
      abi: CONTRACT_ABI, // our EventTicket ABI
      functionName: "pause", // call pause() on contract
    });
  };

  // Handles unpause button click
  const handleUnpause = () => {
    writeContract({
      address: contractAddress, // which contract to write to
      abi: CONTRACT_ABI, // our EventTicket ABI
      functionName: "unpause", // call unpause() on contract
    });
  };

  // Refetch paused state after transaction confirms
  useState(() => {
    if (txHash && !isConfirming) {
      refetch(); // refresh paused state from blockchain
    }
  });

  return (
    <Card>
      <CardBody className="space-y-5">
        <h2 className="font-semibold text-text-primary">Contract Controls</h2>

        {/* ── Contract Address ── */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-text-secondary">Contract Address</p>
          <Link
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-text text-xs text-accent-cyan hover:opacity-80 transition-opacity"
          >
            {/* Shorten address: 0x1234...5678 */}
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </Link>
        </div>

        <div className="divider my-0" />

        {/* ── Contract Status ── */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-text-primary">
              Contract Status
            </p>
            <p className="text-xs text-text-secondary">
              {isPaused
                ? "Ticket sales are currently paused."
                : "Ticket sales are active and running."}
            </p>
          </div>

          {/* Status badge — green if active, yellow if paused */}
          {isPaused ? (
            <Badge variant="pending" dot>
              Paused
            </Badge>
          ) : (
            <Badge variant="active" dot>
              Active
            </Badge>
          )}
        </div>

        <div className="divider my-0" />

        {/* ── Pause / Unpause Button ── */}
        <div className="flex flex-col gap-2">
          {isPaused ? (
            // Show unpause button when paused
            <Button
              onClick={handleUnpause}
              isLoading={isLoading}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? "Confirming..." : "▶ Resume Ticket Sales"}
            </Button>
          ) : (
            // Show pause button when active
            <Button
              onClick={handlePause}
              isLoading={isLoading}
              disabled={isLoading}
              variant="danger"
              className="w-full"
            >
              {isLoading ? "Confirming..." : "⏸ Pause Ticket Sales"}
            </Button>
          )}

          {/* Warning message */}
          <p className="text-xs text-text-secondary text-center">
            {isPaused
              ? "Resuming will allow users to purchase tickets again."
              : "Pausing will immediately stop all ticket purchases."}
          </p>
        </div>

        {/* ── Transaction confirming indicator ── */}
        {isConfirming && (
          <p className="text-xs text-accent-cyan text-center">
            Waiting for transaction to confirm...
          </p>
        )}
      </CardBody>
    </Card>
  );
};

export default ContractControls;
