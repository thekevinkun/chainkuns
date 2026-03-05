// ============================================
// Ticket Server Actions — Chainkuns
// Handles ticket validation at the door.
// Runs on the SERVER — never exposed to browser.
// ============================================

"use server";

import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { ValidateTicketSchema } from "@/lib/validations/ticket.schema";

// The shape of what this action returns
export type TicketActionResult =
  | { success: true } // success — ticket marked as used
  | { success: false; error: string }; // failure — returns error message

// validateTicket — Server Action
// Called after QR scan + contract useTicket() succeeds
// Marks the ticket as used in Supabase
export async function validateTicket(
  formData: unknown, // unknown because we validate with Zod below
): Promise<TicketActionResult> {
  // 1. CHECK — is the user logged in?
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "You must connect your wallet first." };
  }

  // 2. VALIDATE — run Zod schema on the input
  const parsed = ValidateTicketSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // 3. GET user from Supabase using wallet address
  const { data: user } = await supabase
    .from("users")
    .select("id") // we only need the ID
    .eq("wallet_address", session.user.address)
    .single();

  if (!user) {
    return { success: false, error: "User not found. Please sign in again." };
  }

  // 4. GET organizer profile — only organizers can validate tickets
  const { data: organizer } = await supabase
    .from("organizer_profiles")
    .select("id") // we only need the ID
    .eq("user_id", user.id)
    .single();

  if (!organizer) {
    return { success: false, error: "Only organizers can validate tickets." };
  }

  // 5. GET event — verify this contract belongs to this organizer
  const { data: event } = await supabase
    .from("events")
    .select("id") // we only need the ID
    .eq("contract_address", parsed.data.contract_address) // find by contract address
    .eq("organizer_id", organizer.id) // must belong to this organizer
    .single();

  if (!event) {
    return {
      success: false,
      error: "Event not found or you don't have permission.",
    };
  }

  // 6. FIND ticket in Supabase by token_id + event_id
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, is_used") // check if already used
    .eq("token_id", parsed.data.token_id)
    .eq("event_id", event.id)
    .single();

  if (!ticket) {
    return { success: false, error: "Ticket not found." };
  }

  // 7. CHECK — already used?
  if (ticket.is_used) {
    return { success: false, error: "This ticket has already been used." };
  }

  // 8. MARK as used in Supabase
  const { error: updateError } = await supabase
    .from("tickets")
    .update({ is_used: true }) // mark as used
    .eq("id", ticket.id);

  if (updateError) {
    return {
      success: false,
      error: "Failed to validate ticket. Please try again.",
    };
  }

  return { success: true };
}
