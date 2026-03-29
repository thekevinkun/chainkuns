"use server";

import { auth } from "@/auth";
import { pinata } from "@/lib/pinata";
import { formatDateShort } from "@/lib/utils/format";
import { mintRateLimiter, checkRateLimit } from "@/lib/ratelimit";

interface TicketMetadataInput {
  eventTitle: string;
  eventDate: string;
  venue: string;
  ticketPriceEth: string;
  tokenId: number;
  contractAddress: string;
  bannerImageUrl: string | null;
}

export async function uploadTicketMetadata(
  input: TicketMetadataInput,
): Promise<{ uri: string; error?: never } | { uri?: never; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.address) throw new Error("Not authenticated");

    // Rate limit — catch and return as proper error instead of throwing
    try {
      await checkRateLimit(mintRateLimiter, session.user.address.toLowerCase());
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Rate limit exceeded.",
      };
    }

    const metadata = {
      name: `${input.eventTitle} — Ticket #${input.tokenId}`,
      description: `NFT ticket for ${input.eventTitle} at ${
        input.venue
      }. Valid for entry on ${formatDateShort(input.eventDate)}.`,
      image: input.bannerImageUrl ?? "https://chainkuns.io/og-image.png",
      attributes: [
        { trait_type: "Event", value: input.eventTitle },
        { trait_type: "Venue", value: input.venue },
        { trait_type: "Date", value: formatDateShort(input.eventDate) },
        { trait_type: "Price", value: `${input.ticketPriceEth} ETH` },
        { trait_type: "Token ID", value: String(input.tokenId) },
        { trait_type: "Contract", value: input.contractAddress },
      ],
    };

    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });
    const metadataFile = new File(
      [metadataBlob],
      `ticket-${input.contractAddress}-${input.tokenId}.json`,
      { type: "application/json" },
    );

    const upload = await pinata.upload.public.file(metadataFile);
    return { uri: `ipfs://${upload.cid}` };
  } catch (err) {
    console.error("[uploadTicketMetadata] Pinata error:", err);
    return { error: err instanceof Error ? err.message : "IPFS upload failed" };
  }
}
