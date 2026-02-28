// Utility function to merge Tailwind classes cleanly
// Combines clsx (conditional classes) with tailwind-merge (removes conflicts)
import { clsx, type ClassValue } from "clsx"; // clsx handles conditional class logic
import { twMerge } from "tailwind-merge"; // twMerge removes duplicate/conflicting Tailwind classes

// Merges any number of class values into one clean string
// Example: cn('px-2 px-4') → 'px-4' (last one wins)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs)); // first resolve conditions, then remove conflicts
}
