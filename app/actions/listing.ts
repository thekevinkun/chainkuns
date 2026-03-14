// ============================================
// Listing Server Actions — Chainkuns
// All resale marketplace operations:
// create listing, cancel listing, record buy,
// and fetch listings for display
// ============================================
"use server";

import { auth } from "@/auth"; // get the current user's session
import { createServiceClient } from "@/lib/supabase/server"; // service client — bypasses RLS
import {
  checkRateLimit,
  listingRateLimiter,
  buyListingRateLimiter,
} from "@/lib/ratelimit"; // rate limiters
import {
  CreateListingSchema,
  CancelListingSchema,
  RecordBuySchema,
  type CreateListingInput,
  type CancelListingInput,
  type RecordBuyInput,
} from "@/lib/validations/listing.schema"; // Zod schemas
import type { ApiResponse, Listing } from "@/types"; // shared types

// ============================================
// createListing
// Called after seller successfully calls listTicket()
// on-chain. Records the listing in Supabase.
// ============================================
export async function createListing(
  input: CreateListingInput,
): Promise<ApiResponse<Listing>> {
  try {
    // 1. Check auth — must be logged in with wallet
    const session = await auth();
    if (!session?.user?.address) {
      return { data: null, error: "Not authenticated.", success: false };
    }

    const sellerWallet = session.user.address.toLowerCase(); // normalize to lowercase

    // 2. Rate limit — 10 listings per hour per wallet
    await checkRateLimit(listingRateLimiter, sellerWallet);

    // 3. Validate input with Zod
    const parsed = CreateListingSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues[0].message, // return first error
        success: false,
      };
    }

    const { ticket_id, price_eth, list_tx_hash } = parsed.data;

    const supabase = createServiceClient(); // service key — can write to listings

    // 4. Verify the ticket exists AND belongs to this wallet
    // Never trust the client about ownership — check the DB
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("id, owner_wallet, event_id, is_used")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return { data: null, error: "Ticket not found.", success: false };
    }

    // 5. Ownership check — seller must own the ticket
    if (ticket.owner_wallet.toLowerCase() !== sellerWallet) {
      return {
        data: null,
        error: "You do not own this ticket.",
        success: false,
      };
    }

    // 6. Can't list a used ticket — it's been scanned at the door
    if (ticket.is_used) {
      return {
        data: null,
        error: "This ticket has already been used.",
        success: false,
      };
    }

    // 7. Check for duplicate active listing on same ticket
    // One ticket can only have one active listing at a time
    const { data: existingListing } = await supabase
      .from("listings")
      .select("id")
      .eq("ticket_id", ticket_id)
      .eq("status", "active")
      .maybeSingle(); // returns null if not found (doesn't throw)

    if (existingListing) {
      return {
        data: null,
        error: "This ticket is already listed for sale.",
        success: false,
      };
    }

    // 8. Insert the listing record
    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        ticket_id,
        seller_wallet: sellerWallet, // always from session — never from client
        price_eth,
        status: "active", // starts as active
        list_tx_hash,
      })
      .select()
      .single();

    if (insertError || !listing) {
      return { data: null, error: "Failed to create listing.", success: false };
    }

    return { data: listing as Listing, error: null, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return { data: null, error: message, success: false };
  }
}

// ============================================
// cancelListing
// Called when seller wants to delist their ticket.
// ============================================
export async function cancelListing(
  input: CancelListingInput,
): Promise<ApiResponse<null>> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.address) {
      return { data: null, error: "Not authenticated.", success: false };
    }

    const sellerWallet = session.user.address.toLowerCase();

    // 2. Rate limit — shared with createListing limiter
    await checkRateLimit(listingRateLimiter, sellerWallet);

    // 3. Validate input
    const parsed = CancelListingSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues[0].message,
        success: false,
      };
    }

    const supabase = createServiceClient();

    // 4. Fetch the listing to verify ownership and status
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("id, seller_wallet, status")
      .eq("id", parsed.data.listing_id)
      .single();

    if (fetchError || !listing) {
      return { data: null, error: "Listing not found.", success: false };
    }

    // 5. Ownership check — only the seller can cancel their own listing
    if (listing.seller_wallet.toLowerCase() !== sellerWallet) {
      return {
        data: null,
        error: "You do not own this listing.",
        success: false,
      };
    }

    // 6. Status check — can't cancel a listing that's already sold or cancelled
    if (listing.status !== "active") {
      return {
        data: null,
        error: "This listing is no longer active.",
        success: false,
      };
    }

    // 7. Update status to cancelled
    const { error: updateError } = await supabase
      .from("listings")
      .update({
        status: "cancelled",
        cancel_tx_hash: parsed.data.cancel_tx_hash, // store proof
      } as never)
      .eq("id", parsed.data.listing_id);

    if (updateError) {
      return { data: null, error: "Failed to cancel listing.", success: false };
    }

    return { data: null, error: null, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return { data: null, error: message, success: false };
  }
}

// ============================================
// recordBuy
// Called AFTER buyer successfully calls buyTicket()
// on-chain. Syncs the ownership change to Supabase.
// ============================================
export async function recordBuy(
  input: RecordBuyInput,
): Promise<ApiResponse<null>> {
  try {
    // 1. Auth check — buyer must be logged in
    const session = await auth();
    if (!session?.user?.address) {
      return { data: null, error: "Not authenticated.", success: false };
    }

    const buyerWallet = session.user.address.toLowerCase(); // always from session

    // 2. Rate limit — 5 buys per hour per wallet
    await checkRateLimit(buyListingRateLimiter, buyerWallet);

    // 3. Validate input
    const parsed = RecordBuySchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues[0].message,
        success: false,
      };
    }

    const { listing_id, buy_tx_hash } = parsed.data;

    const supabase = createServiceClient();

    // 4. Idempotency check — same tx hash cannot be processed twice
    // Prevents replaying a tx hash to steal ownership update
    const { data: existingBuy } = await supabase
      .from("listings")
      .select("id")
      .eq("buy_tx_hash" as never, buy_tx_hash) // check if this tx was already processed
      .maybeSingle();

    if (existingBuy) {
      // Already processed — return success silently (idempotent)
      return { data: null, error: null, success: true };
    }

    // 5. Fetch the listing — must exist and be active
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("id, ticket_id, seller_wallet, status, price_eth")
      .eq("id", listing_id)
      .single();

    if (fetchError || !listing) {
      return { data: null, error: "Listing not found.", success: false };
    }

    // 6. Status check — can only buy an active listing
    if (listing.status !== "active") {
      return {
        data: null,
        error: "This listing is no longer available.",
        success: false,
      };
    }

    // 7. Prevent seller buying their own listing
    if (listing.seller_wallet.toLowerCase() === buyerWallet) {
      return {
        data: null,
        error: "You cannot buy your own listing.",
        success: false,
      };
    }

    // 8. Update listing to sold + record the buy tx hash
    const { error: listingUpdateError } = await supabase
      .from("listings")
      .update({
        status: "sold", // mark as sold
        buy_tx_hash, // store proof of the on-chain transaction
      } as never)
      .eq("id", listing_id);

    if (listingUpdateError) {
      return { data: null, error: "Failed to update listing.", success: false };
    }

    // 9. Update ticket ownership in Supabase to the buyer
    if (!listing.ticket_id) {
      return {
        data: null,
        error: "Listing has no associated ticket.",
        success: false,
      };
    }

    // buyer wallet always comes from session — never from client input
    const { error: ticketUpdateError } = await supabase
      .from("tickets")
      .update({ owner_wallet: buyerWallet }) // transfer ownership
      .eq("id", listing.ticket_id);

    if (ticketUpdateError) {
      return {
        data: null,
        error: "Failed to transfer ticket ownership.",
        success: false,
      };
    }

    return { data: null, error: null, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return { data: null, error: message, success: false };
  }
}

// ============================================
// getListings
// Fetches all active listings for the marketplace page.
// Public — no auth needed.
// ============================================
export async function getListings(): Promise<ApiResponse<Listing[]>> {
  try {
    const supabase = createServiceClient();

    // Fetch active listings joined with ticket and event data
    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        ticket:tickets (
          *,
          event:events (*)
        )
      `,
      ) // join ticket → event for display info
      .eq("status", "active") // only show active listings
      .order("created_at", { ascending: false }); // newest first

    if (error) {
      return { data: null, error: "Failed to fetch listings.", success: false };
    }

    return { data: (data as Listing[]) ?? [], error: null, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return { data: null, error: message, success: false };
  }
}

// ============================================
// getListingsByEvent
// Fetches all active listings for one specific event.
// Used on /events/[id]/resale page.
// Public — no auth needed.
// ============================================
export async function getListingsByEvent(
  eventId: string,
): Promise<ApiResponse<Listing[]>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        ticket:tickets!inner (
          *,
          event:events!inner (*)
        )
      `,
      ) // !inner = only return rows where the join matches
      .eq("ticket.event_id", eventId) // filter by event ID through the ticket join
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: "Failed to fetch listings.", success: false };
    }

    return { data: (data as Listing[]) ?? [], error: null, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return { data: null, error: message, success: false };
  }
}

// ============================================
// getPriceHistory
// Fetches all sold listings for a specific ticket.
// Shows price history on the ticket detail page.
// ============================================
export async function getPriceHistory(
  ticketId: string,
): Promise<ApiResponse<Listing[]>> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("ticket_id", ticketId)
      .eq("status", "sold") // only show completed sales
      .order("created_at", { ascending: false }); // most recent sale first

    if (error) {
      return {
        data: null,
        error: "Failed to fetch price history.",
        success: false,
      };
    }

    return { data: (data as Listing[]) ?? [], error: null, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return { data: null, error: message, success: false };
  }
}
