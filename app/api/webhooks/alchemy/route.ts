// ============================================
// Alchemy Webhook — Chainkuns
// Alchemy calls this endpoint every time a
// TicketMinted event is emitted on any of our contracts
// This keeps Supabase in sync with the blockchain
// automatically — even if the frontend crashes
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// ── Verify the request actually came from Alchemy ──
// Without this check, anyone could POST fake data to our webhook
function isValidAlchemySignature(
  body: string, // raw request body as string
  signature: string, // signature from Alchemy header
  signingKey: string, // our secret key from Alchemy dashboard
): boolean {
  const crypto = require("crypto"); // Node.js built-in crypto module
  const hmac = crypto.createHmac("sha256", signingKey); // create HMAC with our signing key
  hmac.update(body, "utf8"); // hash the raw body
  const digest = hmac.digest("hex"); // get the hex digest
  return digest === signature; // must match Alchemy's signature
}

// ── Webhook Handler ──
export async function POST(request: NextRequest) {
  try {
    // Read the raw body as text — needed for signature verification
    const rawBody = await request.text();

    // Get Alchemy's signature from the request headers
    const signature = request.headers.get("x-alchemy-signature") ?? "";

    // Get our signing key from environment
    const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY ?? "";

    // Reject the request if signature doesn't match
    if (!isValidAlchemySignature(rawBody, signature, signingKey)) {
      console.error("[AlchemyWebhook] Invalid signature — rejecting request");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse the verified body
    const payload = JSON.parse(rawBody);

    // Alchemy sends an array of activities — loop through each one
    const activities = payload?.event?.activity ?? [];

    // Create a Supabase admin client — bypasses RLS, no cookies needed
    // We use direct createClient here because webhooks have no user session
    const supabase = createServiceClient();

    for (const activity of activities) {
      // Each activity has a log — we look for TicketMinted events
      // TicketMinted signature: TicketMinted(address indexed to, uint256 indexed tokenId, string uri)
      const logs = activity?.log?.topics ?? [];

      // The first topic is always the event signature hash
      // TicketMinted keccak256 hash
      const TICKET_MINTED_TOPIC =
        "0xf16f1e8b680ea7f1e8a1f849eb82762cba60ddcef854d36909e3173483281c8c";

      // Skip if this isn't a TicketMinted event
      if (logs[0] !== TICKET_MINTED_TOPIC) continue;

      // Extract data from the activity
      const toAddress = activity?.toAddress?.toLowerCase(); // ticket recipient wallet
      const contractAddress = activity?.fromAddress?.toLowerCase(); // the event contract
      const txHash = activity?.hash; // transaction hash

      // tokenId comes from the log topics[2] — it's a hex string, convert to number
      const tokenId = parseInt(logs[2] ?? "0x0", 16);

      if (!toAddress || !contractAddress || !txHash) {
        console.warn("[AlchemyWebhook] Missing fields in activity — skipping");
        continue;
      }

      // Find the event in Supabase by contract address
      const { data: event } = await supabase
        .from("events")
        .select("id")
        .eq("contract_address", contractAddress)
        .single();

      if (!event) {
        console.warn(
          "[AlchemyWebhook] No event found for contract:",
          contractAddress,
        );
        continue;
      }

      // Check idempotency — don't insert if tx hash already exists
      const { data: existing } = await supabase
        .from("tickets")
        .select("id")
        .eq("mint_tx_hash", txHash)
        .single();

      if (existing) {
        // Already recorded — webhook fired twice (normal), just skip
        console.log("[AlchemyWebhook] Ticket already recorded for tx:", txHash);
        continue;
      }

      // Insert the ticket record into Supabase
      const { error } = await supabase.from("tickets").insert({
        event_id: event.id, // which event
        token_id: tokenId, // real token ID from blockchain
        owner_wallet: toAddress, // who owns it
        mint_tx_hash: txHash, // blockchain proof
        idempotency_key: `webhook-${txHash}`, // unique key for this webhook delivery
        is_used: false, // not scanned at door yet
      });

      if (error) {
        console.error(
          "[AlchemyWebhook] Failed to insert ticket:",
          error.message,
        );
        continue;
      }

      console.log(
        `[AlchemyWebhook] ✅ Ticket #${tokenId} recorded for event ${event.id}`,
      );
    }

    // Always return 200 to Alchemy — otherwise it will retry the webhook
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[AlchemyWebhook] Unexpected error:", err);
    // Still return 200 — we don't want Alchemy to keep retrying on our bugs
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
