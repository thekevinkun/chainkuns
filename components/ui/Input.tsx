// ============================================
// Input Component — Chainkuns
// Styled form input with label, error state,
// and helper text. Designed to work with Zod.
// ============================================

"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

// Props extend native input attributes (value, onChange, type, placeholder, etc.)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // label shown above the input
  error?: string; // Zod validation error message
  helperText?: string; // subtle hint text below input
  leftIcon?: React.ReactNode; // icon inside left edge (e.g. search icon)
  rightIcon?: React.ReactNode; // icon inside right edge (e.g. ETH symbol)
}

// forwardRef lets parent components get a ref to the underlying <input>
// — needed for React Hook Form and similar libraries
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, leftIcon, rightIcon, className, id, ...props },
  ref,
) {
  // Generate an ID if none provided — links label to input for accessibility
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label — only rendered if a label string is provided */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}

      {/* Input wrapper — handles icon positioning */}
      <div className="relative">
        {/* Left icon — positioned inside the input on the left side */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            "input-base", // base styles from globals.css
            error && "input-error", // red border on validation error
            leftIcon && "pl-10", // extra left padding for icon
            rightIcon && "pr-10", // extra right padding for icon
            className,
          )}
          aria-invalid={error ? "true" : undefined} // accessibility for screen readers
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {/* Right icon — ETH symbol, unit labels, etc. */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error message — shown in red below input (from Zod or manual) */}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}

      {/* Helper text — shown in muted grey (only if no error) */}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
