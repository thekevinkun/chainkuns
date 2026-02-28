// ============================================
// TransactionStatus Component — Chainkuns
// Shows the live state of an Ethereum transaction.
// States: pending → confirming → confirmed / failed
// ============================================

import { getTxUrl, formatTxHash } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { TxStatus } from "@/types";

interface TransactionStatusProps {
  status: TxStatus; // current transaction state
  hash: string | null; // transaction hash (null before submission)
  errorMessage?: string; // error message if status === 'failed'
  className?: string;
}

// Configuration for each status — icon, color, and message
const STATUS_CONFIG = {
  idle: null, // nothing to show
  pending: {
    color: "text-warning",
    bgColor: "bg-warning/10 border-warning/30",
    icon: "spinner", // animated spinner
    label: "Waiting for wallet confirmation...", // user needs to approve in MetaMask
  },
  confirming: {
    color: "text-info",
    bgColor: "bg-info/10 border-info/30",
    icon: "spinner",
    label: "Transaction submitted — waiting for block confirmation...",
  },
  confirmed: {
    color: "text-success",
    bgColor: "bg-success/10 border-success/30",
    icon: "check",
    label: "Transaction confirmed!",
  },
  failed: {
    color: "text-error",
    bgColor: "bg-error/10 border-error/30",
    icon: "x",
    label: "Transaction failed",
  },
} as const;

const TransactionStatus = ({
  status,
  hash,
  errorMessage,
  className,
}: TransactionStatusProps) => {
  // Don't render anything in idle state
  if (status === "idle") return null;

  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        "p-4 rounded-lg border",
        config.bgColor,
        className,
      )}
      role="status"
      aria-live="polite" // screen readers announce updates
    >
      {/* Status icon — spinner for in-progress, check/x for terminal states */}
      <div className={cn("flex-shrink-0 mt-0.5", config.color)}>
        {config.icon === "spinner" && (
          // Animated spinner
          <svg
            className="animate-spin w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {config.icon === "check" && (
          // Checkmark
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {config.icon === "x" && (
          // X mark for error
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </p>

        {/* Show error detail if transaction failed */}
        {status === "failed" && errorMessage && (
          <p className="text-xs text-text-secondary mt-1">{errorMessage}</p>
        )}

        {/* Show clickable transaction hash when we have one */}
        {hash && (
          <a
            href={getTxUrl(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-xs mono-text hover:opacity-80 transition-opacity"
          >
            {formatTxHash(hash, 8)} ↗
          </a>
        )}
      </div>
    </div>
  );
};

export default TransactionStatus;
