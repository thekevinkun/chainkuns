"use server";

import { auth } from "@/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { ValidateTicketSchema } from "@/lib/validations/ticket.schema";
import { mintRateLimiter, checkRateLimit } from "@/lib/ratelimit";

export type TicketActionResult =
  | { success: true }
  | { success: false; error: string };

// Pre-validate ticket before blockchain call — prevents MetaMask popup for invalid tickets
export async function preValidateTicket(
  formData: unknown,
): Promise<TicketActionResult> {
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "You must connect your wallet first." };
  }

  if (session?.user?.organizerStatus !== "approved") {
    return { success: false, error: "Not authorized." };
  }

  const parsed = ValidateTicketSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", session.user.address)
    .single();

  if (!user) {
    return { success: false, error: "User not found." };
  }

  const { data: organizer } = await supabase
    .from("organizer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!organizer) {
    return { success: false, error: "Only organizers can validate tickets." };
  }

  // Check this contract belongs to this organizer
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("contract_address", parsed.data.contract_address)
    .eq("organizer_id", organizer.id)
    .single();

  if (!event) {
    return { success: false, error: "This ticket is not for your event." };
  }

  // Check ticket exists and is not used
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, is_used")
    .eq("token_id", parsed.data.token_id)
    .eq("event_id", event.id)
    .single();

  if (!ticket) {
    return { success: false, error: "Ticket not found in database." };
  }

  if (ticket.is_used) {
    return { success: false, error: "This ticket has already been used." };
  }

  return { success: true };
}

export async function validateTicket(
  formData: unknown,
): Promise<TicketActionResult> {
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "You must connect your wallet first." };
  }

  if (session?.user?.organizerStatus !== "approved") {
    return { success: false, error: "Not authorized." };
  }

  const parsed = ValidateTicketSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", session.user.address)
    .single();

  if (!user) {
    return { success: false, error: "User not found. Please sign in again." };
  }

  const { data: organizer } = await supabase
    .from("organizer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!organizer) {
    return { success: false, error: "Only organizers can validate tickets." };
  }

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("contract_address", parsed.data.contract_address)
    .eq("organizer_id", organizer.id)
    .single();

  if (!event) {
    return {
      success: false,
      error: "Event not found or you don't have permission.",
    };
  }

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, is_used")
    .eq("token_id", parsed.data.token_id)
    .eq("event_id", event.id)
    .single();

  if (!ticket) {
    return { success: false, error: "Ticket not found." };
  }

  if (ticket.is_used) {
    return { success: false, error: "This ticket has already been used." };
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update({ is_used: true })
    .eq("id", ticket.id);

  if (updateError) {
    return {
      success: false,
      error: "Failed to validate ticket. Please try again.",
    };
  }

  return { success: true };
}

export async function recordMint({
  eventId,
  tokenId,
  txHash,
  idempotencyKey,
}: {
  eventId: string;
  tokenId: number;
  txHash: string;
  idempotencyKey: string;
}): Promise<{ success: boolean; error?: string }> {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "Not authenticated" };
  }

  const supabase = createServiceClient();

  // 2. Idempotency check
  const { data: existing } = await supabase
    .from("tickets")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .single();

  if (existing) {
    return { success: true };
  }

  // 3. Insert — owner_wallet comes from session, not from client
  const { error } = await supabase.from("tickets").insert({
    event_id: eventId,
    token_id: tokenId,
    owner_wallet: session.user.address.toLowerCase(), // always from server session
    mint_tx_hash: txHash,
    idempotency_key: idempotencyKey,
    is_used: false,
  });

  if (error) {
    console.error("[recordMint] Supabase error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Pre-check rate limit before minting — call this BEFORE MetaMask popup
export async function checkMintRateLimit(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    await checkRateLimit(mintRateLimiter, session.user.address.toLowerCase());
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Rate limit exceeded.",
    };
  }
}
