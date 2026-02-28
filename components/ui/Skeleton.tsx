// ============================================
// Skeleton Component — Chainkuns
// Animated shimmer placeholders shown while
// content is loading. Used everywhere data fetches.
// ============================================

import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  style?: React.CSSProperties; // for custom inline styles (e.g., dynamic sizes)
  className?: string; // controls width, height, and shape
}

// Base skeleton — a pulsing grey rectangle
export default function Skeleton({ style, className }: SkeletonProps) {
  return (
    <div
      style={style}
      className={cn("skeleton", className)} // skeleton class from globals.css
      aria-hidden="true" // hidden from screen readers
    />
  );
}

// ── Preset Skeletons for common UI patterns ──

// Full event card skeleton — matches EventCard dimensions
export function EventCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden" aria-hidden="true">
      {/* Banner image area */}
      <Skeleton className="w-full h-48" />

      <div className="p-4 space-y-3">
        {/* Event title */}
        <Skeleton className="h-5 w-3/4 rounded" />

        {/* Venue + date row */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-1/3 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Ticket card skeleton — matches TicketCard dimensions
export function TicketCardSkeleton() {
  return (
    <div className="card-surface p-4 space-y-4" aria-hidden="true">
      <div className="flex items-start gap-4">
        {/* QR code area */}
        <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-4/5 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// Text line skeletons — for paragraphs and descriptions
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 rounded",
            i === lines - 1 ? "w-2/3" : "w-full", // last line is shorter (looks natural)
          )}
        />
      ))}
    </div>
  );
}

// Avatar skeleton — for wallet address avatars
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      style={{ width: size, height: size }}
      className="rounded-full flex-shrink-0"
      aria-hidden="true"
    />
  );
}
