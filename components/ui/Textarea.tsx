// ============================================
// Textarea Component — Chainkuns
// Multi-line text input for event descriptions,
// organizer bios, and other long text fields.
// ============================================

"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; // label shown above
  error?: string; // Zod error message
  helperText?: string; // hint text below
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, helperText, className, id, ...props },
    ref,
  ) {
    const textareaId =
      id ?? `textarea-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "input-base", // reuse same base styles as Input
            "min-h-[120px] resize-y", // allow vertical resize only
            error && "input-error", // red border on error
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />

        {/* Error message */}
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-xs text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="text-xs text-text-secondary">{helperText}</p>
        )}
      </div>
    );
  },
);

export default Textarea;
