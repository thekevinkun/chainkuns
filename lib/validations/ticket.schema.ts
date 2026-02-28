// ============================================
// Ticket Validation Schemas — Chainkuns
// Used when listing tickets for resale,
// selling back, and validating at the door
// ============================================

import { z } from "zod"; // Zod is our validation library

// Schema for creating a resale listing
export const CreateListingSchema = z.object({
  ticket_id: z.string().uuid("Invalid ticket ID"), // must be a valid UUID

  price_eth: z
    .number()
    .positive("Price must be positive")
    .max(100, "Maximum listing price is 100 ETH"),
});

// TypeScript type derived from the schema
export type CreateListingInput = z.infer<typeof CreateListingSchema>;

// Schema for the sell-back action (returning ticket to platform)
export const SellBackSchema = z.object({
  ticket_id: z.string().uuid("Invalid ticket ID"),
  token_id: z.number().int().min(0, "Invalid token ID"), // the NFT token ID on-chain
});

export type SellBackInput = z.infer<typeof SellBackSchema>;

// Schema for validating a ticket at the door (QR scan)
export const ValidateTicketSchema = z.object({
  token_id: z.number().int().min(0, "Invalid token ID"),
  contract_address: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/, "Invalid contract address"), // must look like a real ETH address
});

export type ValidateTicketInput = z.infer<typeof ValidateTicketSchema>;
