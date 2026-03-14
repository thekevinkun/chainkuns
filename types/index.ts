// ============================================
// Shared TypeScript Interfaces — Chainkuns
// Every data shape used across the app lives here
// Zero any types allowed — everything explicitly typed
// ============================================

// ── USER ──

// A user who signed in with their Ethereum wallet
export interface User {
  id: string; // UUID from Supabase
  wallet_address: string; // their ETH address (primary identity)
  created_at: string; // ISO timestamp when they first signed in
}

// ── ORGANIZER ──

// Public profile for an event organizer (must be admin-approved)
export interface OrganizerProfile {
  id: string; // UUID
  user_id: string; // references User.id
  display_name: string; // shown publicly on events
  bio: string | null; // optional organizer bio
  logo_url: string | null; // optional logo image URL (Pinata IPFS)
  is_verified: boolean; // admin must set this to true before they can publish
  created_at: string;
}

// ── EVENT ──

// All possible statuses an event can be in
export type EventStatus = "draft" | "active" | "completed" | "cancelled";

// A ticketed event created by an approved organizer
export interface Event {
  id: string; // UUID
  organizer_id: string | null; // references OrganizerProfile.id
  title: string; // event name
  description: string | null; // long description (AI-generated or manual)
  banner_image_url: string | null; // IPFS image URL shown as event banner
  venue: string | null; // physical or virtual location
  event_date: string; // ISO timestamp of when the event happens
  total_supply: number; // max number of tickets (set at creation)
  ticket_price_eth: number; // price in ETH (e.g. 0.05)
  royalty_percent: number; // % organizer earns on every resale (0-10)
  contract_address: string | null; // deployed EventTicket.sol address on Sepolia
  status: EventStatus | null; // current state of the event
  created_at: string | null;
  organizer?: OrganizerProfile; // joined from organizer_profiles when fetching event details
}

// ── TICKET ──

// A single NFT ticket owned by a user
export interface Ticket {
  id: string; // UUID in Supabase
  event_id: string | null; // references Event.id
  token_id: number; // the NFT token ID on-chain
  owner_wallet: string; // current owner's ETH address
  is_used: boolean | null; // true once scanned at the door
  mint_tx_hash: string | null; // transaction hash proving the mint happened
  idempotency_key: string | null; // prevents double-minting on network failure
  created_at: string | null;
  event?: Event; // joined from events when fetching user's tickets
}

export type EventWithTicketCount = Event & {
  tickets: [{ count: number }]; // Supabase returns count as array with one object
};

// Row type returned by Supabase join
export type TicketWithEvent = Omit<Ticket, "event"> & {
  event: Event | null;
};

// ── LISTING (Resale Marketplace) ──

// All possible states for a resale listing
export type ListingStatus = "active" | "sold" | "cancelled";

// A ticket listed for peer-to-peer resale
export interface Listing {
  id: string;
  ticket_id: string;
  seller_wallet: string;
  price_eth: number;
  status: ListingStatus;
  list_tx_hash: string | null;
  created_at: string;
  ticket?: Ticket & {
    event?: Event; // event is nested inside ticket — matches Supabase join shape
  };
  event?: Event; // keep this for direct joins (e.g. getPriceHistory future use)
}

// ── WEB3 / WALLET ──

// Status of an Ethereum transaction
export type TxStatus =
  | "idle"
  | "pending"
  | "confirming"
  | "confirmed"
  | "failed";

// Tracks a live transaction the user submitted
export interface TransactionState {
  hash: string | null; // tx hash (null before submission)
  status: TxStatus; // current state
  error: string | null; // error message if failed
}

// ── API RESPONSES ──

// Standard response wrapper used across all Server Actions
export interface ApiResponse<T> {
  data: T | null; // the returned data (null on error)
  error: string | null; // error message (null on success)
  success: boolean; // quick check: did it work?
}

// ── ANALYTICS (Organizer Dashboard) ──

// Sales stats for a single event
export interface EventAnalytics {
  event_id: string;
  total_minted: number; // tickets sold so far
  total_supply: number; // max possible
  revenue_eth: number; // total ETH earned from primary sales
  resale_revenue_eth: number; // total royalties earned from resales
  tickets_used: number; // scanned at door
  active_listings: number; // currently listed for resale
}

// ── Form Data Type ──
// Matches CreateEventSchema fields exactly
// number | "" allows empty inputs without TypeScript errors
export interface EventFormState {
  title: string; // event name
  description: string; // event description (can be AI generated)
  venue: string; // event location
  event_date: string; // ISO datetime string
  total_supply: string; // max tickets available
  ticket_price_eth: string; // price per ticket in ETH
  royalty_percent: string; // % organizer gets on resale (max 10%)
  banner_image_url: string | null; // Supabase Storage URL after upload
}
