// ============================================
// Event Validation Schema — Chainkuns
// Used on BOTH the frontend form and the Server Action
// So validation runs twice — never trust just the frontend
// ============================================

import { z } from "zod"; // Zod is our validation library

// Schema for creating a new event
export const CreateEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters") // too short = probably a mistake
    .max(100, "Title must be under 100 characters"), // keep titles reasonable

  description: z
    .string()
    .min(20, "Please provide at least a brief description")
    .max(5000, "Description too long"),

  venue: z.string().min(2, "Venue is required").max(200, "Venue name too long"),

  event_date: z
    .string()
    .datetime({ message: "Invalid date format" }) // must be a valid ISO date string
    .refine(
      (val) => new Date(val) > new Date(), // must be in the future
      "Event date must be in the future",
    ),

  total_supply: z
    .number()
    .int("Must be a whole number") // no decimal tickets
    .min(1, "At least 1 ticket required")
    .max(10000, "Maximum 10,000 tickets per event"),

  ticket_price_eth: z
    .number()
    .positive("Price must be positive")
    .max(100, "Maximum ticket price is 100 ETH"),

  royalty_percent: z
    .number()
    .min(0, "Royalty cannot be negative")
    .max(10, "Maximum royalty is 10%"), // also hardcoded in the smart contract

  banner_image_url: z.string().url("Invalid image URL").optional().nullable(), // not required when creating the event
});

// TypeScript type derived from the schema — use this instead of writing the type manually
export type CreateEventInput = z.infer<typeof CreateEventSchema>;

// Schema for updating an existing event — same fields but all optional
export const UpdateEventSchema = CreateEventSchema.partial().extend({
  id: z.string().uuid("Invalid event ID"), // id is required when updating
});

export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
