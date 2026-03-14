// ============================================
// Event Server Actions — Chainkuns
// Handles event creation on the server.
// Runs on the SERVER — never exposed to browser.
// ============================================

"use server";

import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateEventSchema } from "@/lib/validations/event.schema";
import { createEventRateLimiter, checkRateLimit } from "@/lib/ratelimit";

// The shape of what this action returns
export type EventActionResult =
  | { success: true; eventId: string } // success — returns the new event ID
  | { success: false; error: string }; // failure — returns error message

// createEvent — Server Action
// Called when organizer submits the event form
export async function createEvent(
  formData: unknown, // unknown because we validate with Zod below
): Promise<EventActionResult> {
  // 1. CHECK — is the user logged in?
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "You must connect your wallet first." };
  }

  // 2. RATE LIMIT — prevent spam event creation
  await checkRateLimit(createEventRateLimiter, session.user.address);

  // 3. VALIDATE — run Zod schema on the form data
  const parsed = CreateEventSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  console.log("total_supply from Zod:", parsed.data.total_supply);
  const supabase = await createClient();

  // 4. GET user from Supabase using wallet address from session
  const { data: user } = await supabase
    .from("users")
    .select("id") // we only need the ID
    .eq("wallet_address", session.user.address)
    .single();

  if (!user) {
    return { success: false, error: "User not found. Please sign in again." };
  }

  // 5. GET organizer profile — must be approved to create events
  const { data: organizer } = await supabase
    .from("organizer_profiles")
    .select("id, status") // check status is approved
    .eq("user_id", user.id)
    .single();

  if (!organizer || organizer.status !== "approved") {
    return {
      success: false,
      error: "You must be an approved organizer to create events.",
    };
  }

  // 6. INSERT — save the event to Supabase
  // contract_address is null for now — gets set after contract deploy
  const { data: event, error: insertError } = await supabase
    .from("events")
    .insert({
      organizer_id: organizer.id, // link to organizer profile
      title: parsed.data.title,
      description: parsed.data.description,
      venue: parsed.data.venue,
      event_date: parsed.data.event_date,
      total_supply: parsed.data.total_supply,
      ticket_price_eth: parsed.data.ticket_price_eth,
      royalty_percent: parsed.data.royalty_percent,
      banner_image_url: parsed.data.banner_image_url ?? null,
      status: "active", // default to active when created
    })
    .select("id") // return the new event ID
    .single();

  if (insertError || !event) {
    return {
      success: false,
      error: "Failed to create event. Please try again.",
    };
  }

  // 7. Return the new event ID — frontend will use this to deploy the contract
  return { success: true, eventId: event.id };
}

// updateEventContract — Server Action
// Called AFTER the contract is deployed on the frontend
// Updates the event row with the deployed contract address
export async function updateEventContract(
  eventId: string, // the event we just created
  contractAddress: string, // the deployed contract address from MetaMask
): Promise<EventActionResult> {
  // 1. CHECK — is the user logged in?
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "You must connect your wallet first." };
  }

  const supabase = await createClient();

  // 2. GET user from Supabase using wallet address
  const { data: user } = await supabase
    .from("users")
    .select("id") // we only need the ID
    .eq("wallet_address", session.user.address)
    .single();

  if (!user) {
    return { success: false, error: "User not found. Please sign in again." };
  }

  // 3. GET organizer profile — make sure this event belongs to them
  const { data: organizer } = await supabase
    .from("organizer_profiles")
    .select("id") // we only need the ID
    .eq("user_id", user.id)
    .single();

  if (!organizer) {
    return { success: false, error: "Organizer profile not found." };
  }

  // 4. UPDATE — save the contract address to the event
  // We also verify organizer_id matches — prevents one organizer updating another's event
  const { error: updateError } = await supabase
    .from("events")
    .update({ contract_address: contractAddress }) // save the deployed address
    .eq("id", eventId) // target this specific event
    .eq("organizer_id", organizer.id); // security check — must be their event

  if (updateError) {
    return {
      success: false,
      error: "Failed to save contract address. Please try again.",
    };
  }

  return { success: true, eventId }; // return eventId so frontend can redirect
}
