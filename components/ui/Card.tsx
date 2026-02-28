// ============================================
// Card Component — Chainkuns
// Container component for grouped content.
// Variants: surface (default), elevated (modals)
// ============================================

import { cn } from "@/lib/utils/cn";

// Style variant — surface is standard, elevated floats above page
type CardVariant = "surface" | "elevated";

interface CardProps {
  variant?: CardVariant; // which background depth to use
  hover?: boolean; // enable hover border glow effect
  className?: string; // extra classes from parent
  children: React.ReactNode; // card content
  onClick?: () => void; // optional click handler (makes it interactive)
}

// Maps variant to the CSS class from globals.css
const variantClasses: Record<CardVariant, string> = {
  surface: "card-surface", // bg-surface with subtle border
  elevated: "card-elevated", // bg-elevated with deep shadow
};

export default function Card({
  variant = "surface",
  hover = false,
  className,
  children,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        variantClasses[variant], // apply the correct depth style
        hover && "card-surface-hover", // add hover glow if requested
        onClick && "cursor-pointer", // show pointer cursor if clickable
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── Sub-components for semantic structure ──────────

// Card header section — title area at the top
export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>;
}

// Card body — main content area
export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

// Card footer — actions or metadata at the bottom
export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}
