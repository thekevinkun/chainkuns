// ============================================
// Avatar Component — Chainkuns
// Generates a deterministic colorful avatar
// from a wallet address (no external lib needed).
// Each wallet always gets the same colors.
// ============================================

import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  address: string; // ETH wallet address — drives the color generation
  size?: number; // diameter in pixels (default: 40)
  className?: string;
}

// Generates a deterministic hue from a wallet address
// — same address always produces the same color
function addressToHue(address: string): number {
  // sum up the char codes of the last 6 chars of the address
  const chunk = address.slice(-6);
  let sum = 0;
  for (let i = 0; i < chunk.length; i++) {
    sum += chunk.charCodeAt(i); // build a number from the address characters
  }
  return sum % 360; // map to 0-359 degree hue value
}

// Generates a second hue for the gradient (offset by 60 degrees)
function addressToGradient(address: string): [string, string] {
  const hue1 = addressToHue(address);
  const hue2 = (hue1 + 60) % 360; // shift 60° for complementary color

  // HSL colors — moderate saturation and lightness for visibility on dark bg
  return [`hsl(${hue1}, 70%, 55%)`, `hsl(${hue2}, 70%, 55%)`];
}

export default function Avatar({ address, size = 40, className }: AvatarProps) {
  // Get two gradient colors derived from the wallet address
  const [colorFrom, colorTo] = addressToGradient(address);

  // Show initials: "0x" + last 2 chars of address
  const initials = address.slice(-2).toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        "font-mono font-bold text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.3, // scale text with avatar size
        background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`, // unique gradient
        boxShadow: `0 0 0 2px rgba(0,212,170,0.2)`, // subtle cyan ring
      }}
      title={address} // show full address on hover for accessibility
      aria-label={`Avatar for ${address}`}
    >
      {initials}
    </div>
  );
}
