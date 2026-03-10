// ============================================
// Pinata IPFS Client — Chainkuns
// Used to upload ticket images + metadata JSON to IPFS
// IPFS = permanent decentralized storage — perfect for NFT data
// NEVER import this in client components — JWT must stay server-side
// ============================================
import { PinataSDK } from "pinata"; // new Pinata SDK (not pinata-web3)

// Create the Pinata client using our credentials from .env.local
export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!, // JWT token — full access to our Pinata account
  pinataGateway: process.env.PINATA_GATEWAY!, // our dedicated gateway URL for fast retrieval
});
