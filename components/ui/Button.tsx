// ============================================
// Button Component — Chainkuns
// All button variants in one component.
// Variants: primary, secondary, ghost, danger
// ============================================

import { cn } from "@/lib/utils/cn";

// All accepted button style variants
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

// All accepted size modifiers
type ButtonSize = "sm" | "md" | "lg";

// Full set of props — extends native button attributes so we get
// onClick, disabled, type="submit" etc. for free
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant; // which style to apply (default: primary)
  size?: ButtonSize; // sizing modifier (default: md)
  isLoading?: boolean; // show spinner and disable interaction
  children: React.ReactNode; // button label / content
}

// Maps each variant name to the CSS class defined in globals.css
const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary", // gradient fill
  secondary: "btn-secondary", // bordered transparent
  ghost: "btn-ghost", // text only
  danger: "btn-danger", // red fill for destructive actions
};

// Maps each size to extra padding overrides
const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm", // compact — px-4 py-2 text-xs
  md: "", // default — no override needed
  lg: "btn-lg", // large CTA — px-8 py-4 text-base
};

export default function Button({
  variant = "primary", // default to primary gradient
  size = "md",
  isLoading = false,
  disabled,
  children,
  className,
  ...props // pass through onClick, type, etc.
}: ButtonProps) {
  return (
    <button
      // disabled if explicitly disabled or while loading
      disabled={disabled || isLoading}
      className={cn(
        variantClasses[variant], // apply the correct style class
        sizeClasses[size], // apply size modifier
        className, // allow parent to add extra classes
      )}
      {...props}
    >
      {/* Show spinner icon while loading, otherwise show children */}
      {isLoading ? (
        <>
          {/* Simple CSS spinner — no library needed */}
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
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
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
