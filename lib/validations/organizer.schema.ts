// ============================================
// Organizer Validation Schema — Chainkuns
// Used when an organizer registers their profile
// Admin must approve before they can publish events
// ============================================

import { z } from "zod"; // Zod is our validation library

// Schema for organizer registration form
export const OrganizerRegistrationSchema = z.object({
  display_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name too long"),

  bio: z
    .string()
    .min(20, "Please write a brief bio (at least 20 characters)") // we want real organizers, not spammers
    .max(500, "Bio too long"),

  logo_url: z.string().url("Invalid logo URL").optional().nullable(), // logo is optional — they can add it later
});

// TypeScript type derived from the schema
export type OrganizerRegistrationInput = z.infer<
  typeof OrganizerRegistrationSchema
>;
