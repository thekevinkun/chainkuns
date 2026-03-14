// ============================================
// Listing Validation Schemas — Chainkuns
// Used in both the frontend and Server Actions
// Zod validates on BOTH sides — never trust client alone
// ============================================

import { z } from "zod"; // Zod validation library

// Schema for creating a new resale listing
export const CreateListingSchema = z.object({
  ticket_id: z.string().uuid("Invalid ticket ID"), // must be a valid UUID
  price_eth: z
    .number()
    .positive("Price must be greater than 0") // can't list for free or negative
    .max(100, "Maximum listing price is 100 ETH"), // sanity cap
  list_tx_hash: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/, "Invalid transaction hash"), // must be a real tx hash
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;

// Schema for cancelling a listing
export const CancelListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  cancel_tx_hash: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/, "Invalid transaction hash"), // proof of on-chain cancel
});

export type CancelListingInput = z.infer<typeof CancelListingSchema>;

// Schema for recording a completed resale buy in Supabase
export const RecordBuySchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  buy_tx_hash: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/, "Invalid transaction hash"), // proof the on-chain tx happened
});

export type RecordBuyInput = z.infer<typeof RecordBuySchema>;
