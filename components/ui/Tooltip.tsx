// ============================================
// Tooltip Component — Chainkuns
// Simple hover tooltip using CSS only (no JS library).
// Shows a hint when user hovers over wrapped content.
// ============================================

"use client";

import { cn } from "@/lib/utils/cn";

// Tooltip position relative to the trigger element
type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string; // the hint text to show
  position?: TooltipPosition; // where to show the tooltip (default: top)
  children: React.ReactNode; // the element that triggers the tooltip on hover
  className?: string;
}

// Maps position to Tailwind positioning classes
const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Tooltip({
  content,
  position = "top",
  children,
  className,
}: TooltipProps) {
  return (
    /* Wrapper is the positioning anchor for the tooltip */
    <div className={cn("relative group inline-flex", className)}>
      {children}

      {/* Tooltip bubble — hidden by default, shown on group hover via CSS */}
      <div
        className={cn(
          "absolute z-50 pointer-events-none", // doesn't block clicks
          positionClasses[position],
          "px-2.5 py-1.5",
          "rounded-md",
          "bg-bg-elevated border border-border",
          "text-xs text-text-primary whitespace-nowrap",
          "shadow-lg shadow-black/50",
          // CSS-only show/hide using group-hover
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-200",
        )}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
}
