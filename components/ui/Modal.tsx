// ============================================
// Modal Component — Chainkuns
// Accessible dialog overlay for confirmations,
// resale forms, sell-back flow, etc.
// ============================================

"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  isOpen: boolean; // controls visibility
  onClose: () => void; // called when user dismisses the modal
  title?: string; // modal heading
  description?: string; // optional subtitle below heading
  children: React.ReactNode; // modal body content
  maxWidth?: "sm" | "md" | "lg"; // controls max width of modal panel
  closeOnBackdrop?: boolean; // whether clicking the backdrop closes the modal
}

// Maps max-width prop to Tailwind class
const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  // Close modal when Escape key is pressed — accessibility requirement
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // prevent background scroll
    }

    // Cleanup when modal closes or component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = ""; // restore scrolling
    };
  }, [isOpen, handleKeyDown]);

  // Don't render anything if modal is closed — keeps DOM clean
  if (!isOpen) return null;

  return (
    /* Backdrop overlay — full screen dark overlay behind the modal */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Clickable backdrop — closes modal on click */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal panel — sits above the backdrop */}
      <div
        className={cn(
          "card-elevated", // elevated card with deep shadow
          "relative w-full", // full width up to max-width
          maxWidthClasses[maxWidth],
          "p-6", // inner padding
          "animate-fade-in-up", // entrance animation from globals.css
        )}
        onClick={(e) => e.stopPropagation()} // prevent backdrop click from firing
      >
        {/* Close button — top right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close modal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Modal header — title + description */}
        {(title || description) && (
          <div className="mb-6 pr-8">
            {title && (
              <h2
                id="modal-title"
                className="font-display font-bold text-xl text-text-primary"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>
        )}

        {/* Modal body — custom content from parent */}
        <div>{children}</div>
      </div>
    </div>
  );
}
