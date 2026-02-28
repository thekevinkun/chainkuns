// ============================================
// Badge Component — Chainkuns
// Small inline status chips for events, tickets,
// organizer profiles, and transaction states.
// ============================================

import { cn } from "@/lib/utils/cn";

// All supported badge variants
type BadgeVariant =
  | "active"
  | "soldout"
  | "pending"
  | "cancelled"
  | "verified"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant; // color scheme (default: grey)
  children: React.ReactNode; // badge label
  className?: string;
  dot?: boolean; // show a small status dot before label
}

// Maps variant to CSS class from globals.css @layer components
const variantClasses: Record<BadgeVariant, string> = {
  active: "badge-active", // green — event is live and selling
  soldout: "badge-soldout", // red — no tickets remain
  pending: "badge-pending", // yellow — awaiting admin approval
  cancelled: "badge-cancelled", // grey — event cancelled
  verified: "badge-verified", // cyan — verified organizer checkmark
  default: "badge", // unstyled base badge
};

// Dot colors matching their variants
const dotColors: Record<BadgeVariant, string> = {
  active: "bg-success",
  soldout: "bg-error",
  pending: "bg-warning",
  cancelled: "bg-text-secondary",
  verified: "bg-accent-cyan",
  default: "bg-text-secondary",
};

export default function Badge({
  variant = "default",
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span className={cn(variantClasses[variant], className)}>
      {/* Optional status dot — a small circle before the label */}
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ── Convenience exports for common patterns ────────

// Active event badge — shown on event cards and detail pages
export function ActiveBadge() {
  return (
    <Badge variant="active" dot>
      Live
    </Badge>
  );
}

// Sold out badge — replaces buy button when no tickets remain
export function SoldOutBadge() {
  return <Badge variant="soldout">Sold Out</Badge>;
}

// Pending approval badge — shown on organizer profile during review
export function PendingBadge() {
  return (
    <Badge variant="pending" dot>
      Pending Approval
    </Badge>
  );
}

// Verified organizer badge — shown next to organizer name
export function VerifiedBadge() {
  return (
    <Badge variant="verified" className="gap-1">
      {/* Checkmark icon — simple SVG, no library needed */}
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 5l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified
    </Badge>
  );
}
