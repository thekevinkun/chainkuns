// ============================================
// Alchemy Webhook — Chainkuns
// Fires on every TicketMinted event on Sepolia
// Checks if the contract belongs to a Chainkuns event
// If yes — saves ticket to Supabase (safety net for recordMint)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

// Verify the request actually came from Alchemy
function isValidAlchemySignature(
  body: string,
  signature: string,
  signingKey: string,
): boolean {
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(body, "utf8");
  const digest = hmac.digest("hex");
  return digest === signature;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-alchemy-signature") ?? "";
    const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY ?? "";

    // Reject if signature doesn't match — prevents fake webhook calls
    if (!isValidAlchemySignature(rawBody, signature, signingKey)) {
      console.error("[AlchemyWebhook] Invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const logs = payload?.event?.data?.block?.logs ?? [];

    const supabase = createServiceClient();

    for (const log of logs) {
      const topics = log?.topics ?? [];
      const txHash = log?.transaction?.hash;
      const contractAddress = log?.account?.address?.toLowerCase();

      // topics[1] = indexed `to` address (padded to 32 bytes) — the ticket recipient
      // topics[2] = indexed `tokenId` (padded to 32 bytes)
      const toAddress = topics[1]
        ? "0x" + topics[1].slice(26) // remove padding — last 20 bytes = address
        : null;
      const tokenId = topics[2]
        ? parseInt(topics[2], 16) // hex to number
        : null;

      if (!txHash || !contractAddress || !toAddress || tokenId === null) {
        console.warn("[AlchemyWebhook] Missing fields — skipping log");
        continue;
      }

      // Check if this contract belongs to any Chainkuns event
      // This is the key change — we look up the contract in Supabase
      // instead of hardcoding addresses in Alchemy
      const { data: event } = await supabase
        .from("events")
        .select("id")
        .ilike("contract_address", contractAddress) // case-insensitive match
        .single();

      if (!event) {
        // Not a Chainkuns contract — ignore silently
        continue;
      }

      // Idempotency — skip if already recorded by recordMint()
      const { data: existing } = await supabase
        .from("tickets")
        .select("id")
        .eq("mint_tx_hash", txHash)
        .single();

      if (existing) {
        console.log("[AlchemyWebhook] Already recorded — skipping:", txHash);
        continue;
      }

      // Insert the ticket — webhook is the safety net
      const { error } = await supabase.from("tickets").insert({
        event_id: event.id,
        token_id: tokenId,
        owner_wallet: toAddress.toLowerCase(),
        mint_tx_hash: txHash,
        idempotency_key: `webhook-${txHash}`,
        is_used: false,
      });

      if (error) {
        console.error("[AlchemyWebhook] Insert failed:", error.message);
        continue;
      }

      console.log(
        `[AlchemyWebhook] ✅ Ticket #${tokenId} saved for event ${event.id}`,
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[AlchemyWebhook] Unexpected error:", err);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
