import type { Event } from "@/types";

// Navigation links shown in the header
export const NAV_LINKS: {
  href: string;
  label: string;
  requiresAuth?: boolean;
}[] = [
  { href: "/events", label: "Browse Events" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/my-tickets", label: "My Tickets", requiresAuth: true },
];

// Footer navigation groups and their respective links
export const FOOTER_LINKS = {
  Platform: [
    { href: "/events", label: "Browse Events" },
    { href: "/marketplace", label: "Resale Market" },
    { href: "/organizer/register", label: "Become an Organizer" },
  ],
  Learn: [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#faq", label: "FAQ" },
  ],
} as const;

// Dummy ticket data — represents what a real minted ticket would look like
export const MOCK_TICKET = {
  eventName: "Ethereum Summit 2025",
  date: "Dec 12, 2025",
  tokenId: "#0042",
  price: "0.05 ETH",
  seat: "A-14",
  section: "VIP",
  // QR code encodes a URL — same pattern real tickets will use
  qrData: "https://chainkuns.io/tickets/0042",
};

// ── Feature data ──
export const FEATURES = [
  {
    icon: "🎟️",
    title: "NFT Tickets",
    description:
      "Every ticket is a unique NFT minted on Ethereum. Fully verifiable, transferable, and yours forever.",
  },
  {
    icon: "💸",
    title: "Auto Royalties",
    description:
      "Organizers earn a percentage on every resale — automatically enforced by the smart contract. No chasing payments.",
  },
  {
    icon: "🔒",
    title: "Zero Fraud",
    description:
      "Ticket ownership lives on the blockchain. Counterfeits are impossible — every ticket is verified at the door instantly.",
  },
  {
    icon: "🔄",
    title: "Peer-to-Peer Resale",
    description:
      "Can't make it? Sell your ticket directly to another fan. No middlemen, no inflated fees.",
  },
];

// ── Steps data ──
export const STEPS = [
  {
    icon: "🔍",
    title: "Browse Events",
    description:
      "Explore upcoming events created by verified organizers. Filter by date, category, or price.",
  },
  {
    icon: "👛",
    title: "Connect Wallet",
    description:
      "Connect your MetaMask or any Web3 wallet. Sign in securely with Ethereum — no password needed.",
  },
  {
    icon: "🎟️",
    title: "Buy Your Ticket",
    description:
      "Pay with ETH. Your ticket is instantly minted as an NFT directly to your wallet.",
  },
  {
    icon: "✅",
    title: "Show Up & Scan",
    description:
      "At the door, your QR code is scanned. The contract verifies ownership on-chain in seconds.",
  },
];

// ── Stats data — placeholder numbers ──
export const STATS = [
  {
    icon: "🎪",
    value: "124+",
    label: "Events Hosted",
  },
  {
    icon: "🎟️",
    value: "8,300+",
    label: "Tickets Minted",
  },
  {
    icon: "🧑‍💼",
    value: "56+",
    label: "Organizers",
  },
  {
    icon: "⟠",
    value: "430+",
    label: "ETH in Sales",
  },
];

// ── Event filter options ──
export const CATEGORIES = [
  { value: "all", label: "All Events" },
  { value: "music", label: "🎵 Music" },
  { value: "tech", label: "💻 Tech & Web3" },
  { value: "art", label: "🎨 Art & Culture" },
  { value: "sports", label: "⚽ Sports" },
  { value: "food", label: "🍕 Food & Drink" },
];

// Sort options for events listing
export const SORT_OPTIONS = [
  { value: "date_asc", label: "Date — Soonest First" },
  { value: "date_desc", label: "Date — Latest First" },
  { value: "price_asc", label: "Price — Low to High" },
  { value: "price_desc", label: "Price — High to Low" },
];

// ── Mock event data for development/testing ──
export const MOCK_EVENT: Event = {
  id: "1",
  organizer_id: "org-1",
  title: "Ethereum Summit 2025",
  description:
    "Join us for the biggest Ethereum event of the year. Three days of talks, workshops, and networking with the brightest minds in Web3. From DeFi to NFTs, smart contract security to Layer 2 scaling — this is the event you cannot miss.",
  banner_image_url: null,
  venue: "Bali International Convention Centre",
  event_date: new Date("2025-12-12T09:00:00").toISOString(),
  total_supply: 500,
  ticket_price_eth: 0.05,
  royalty_percent: 5,
  contract_address: "0x5e258D6C77CaFEC0D4E0D177be4f7070256962CA",
  status: "active",
  created_at: new Date().toISOString(),
};
