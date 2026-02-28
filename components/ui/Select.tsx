// ============================================
// Select Component — Chainkuns
// Styled dropdown for form fields like
// category, sort order, ticket type, etc.
// ============================================

"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

// A single option in the dropdown
export interface SelectOption {
  value: string; // the actual value stored
  label: string; // what the user sees
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[]; // the list of choices
  placeholder?: string; // grey first option when nothing selected
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, helperText, options, placeholder, className, id, ...props },
  ref,
) {
  const selectId = id ?? `select-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}

      {/* Select wrapper — for custom chevron icon */}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "input-base", // reuse input styles
            "appearance-none", // hide native browser arrow
            "pr-10", // space for custom arrow icon
            "cursor-pointer",
            error && "input-error",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          {...props}
        >
          {/* Placeholder option — not selectable after initial selection */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* Render all provided options */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-bg-surface" // style the dropdown items
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom chevron arrow — replaces browser default */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Error / helper text */}
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-text-secondary">{helperText}</p>
      )}
    </div>
  );
});

export default Select;
