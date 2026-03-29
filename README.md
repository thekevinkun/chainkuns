# Chainkuns — The Future of Event Ticketing is On-Chain

Chainkuns is a production-grade Web3 NFT event ticketing platform built on Ethereum. Organizers deploy their own smart contracts per event, users mint tickets as NFTs directly to their wallets, and the resale marketplace enforces automatic royalties on-chain — zero middlemen, zero fraud.

Live on Sepolia Testnet.

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

**Blockchain**
- Solidity 0.8.28+
- Hardhat
- Wagmi 2.x
- Viem
- RainbowKit

**Backend & Auth**
- NextAuth v5 (SIWE — Sign In With Ethereum)
- Supabase (PostgreSQL + RLS + Storage)
- Upstash Redis (rate limiting)

**Services**
- Pinata (IPFS — NFT metadata storage)
- Alchemy (NFT API + Webhooks)
- OpenAI (AI event description generation)

---

## Features

**For Attendees**
- Connect wallet via MetaMask or any RainbowKit-supported wallet
- Browse active events and buy tickets as NFTs
- View owned tickets in My Tickets with QR codes
- List tickets for peer-to-peer resale
- Buy resale tickets from other users

**For Organizers**
- Register as an organizer (requires admin approval)
- Create events — each deploys a fresh `EventTicket.sol` contract automatically
- AI-powered event description generation (OpenAI)
- Manage events — view ticket sales, revenue, and royalty earnings
- Pause/unpause ticket sales via contract controls
- Scan attendee QR codes at the door to validate entry

**On-Chain**
- Each event is its own ERC-721 contract
- Royalty splits enforced automatically on every resale
- Ticket validation marked on-chain — cannot be forged
- ReentrancyGuard and Pausable on all contracts

---

## Architecture
```
User clicks Buy Ticket
  → wagmi calls mintTicket() on EventTicket.sol
  → ETH sent to contract
  → NFT minted to user wallet
  → Alchemy Webhook fires → Supabase updated
  → My Tickets page shows new ticket

Organizer creates event
  → Form saved to Supabase
  → MetaMask deploys fresh EventTicket.sol
  → Contract address saved to Supabase

Resale flow
  → Seller calls listTicket() on-chain
  → Buyer calls buyTicket() on-chain
  → Contract splits ETH: seller gets (price - royalty), organizer gets royalty
  → Supabase synced via Server Action
```

---

## Project Structure
```
chainkuns/
├── app/
│   ├── (admin)/          — Admin pages (approve/reject organizers)
│   ├── (organizer)/      — Organizer dashboard, event creation, manage
│   ├── (public)/         — Landing, browse events, marketplace, event detail
│   ├── (tickets)/        — Ticket detail page (/tickets/[contractAddress]/[tokenId])
│   ├── (user)/           — My Tickets
│   └── actions/          — Server Actions (event, ticket, listing, organizer, ai, ipfs)
├── components/
│   ├── events/           — EventCard, EventHero, EventFilters, EventForm, BrowseEvents
│   ├── landing/          — HeroSection, FeaturesSection, StatsSection, etc.
│   ├── marketplace/      — ListingGrid, ListingCard, BuyListingModal, etc.
│   ├── organizer/        — OrganizerDashboard, EventTable, AnalyticsCard
│   ├── tickets/          — TicketCard, TicketDetail, QRScanner, ContractControls
│   ├── ui/               — Button, Input, Card, Badge, Skeleton, etc.
│   └── web3/             — WalletConnect, WalletAddress
├── contracts/
│   └── EventTicket.sol   — ERC-721 contract with mint, list, buy, cancel, useTicket
├── lib/
│   ├── supabase/         — Server/client/service Supabase clients + storage upload
│   ├── web3/             — Contract ABI, bytecode, SIWE message builder
│   ├── validations/      — Zod schemas for all Server Actions
│   ├── ratelimit.ts      — Upstash Redis rate limiters
│   ├── openai.ts         — OpenAI client
│   └── pinata.ts         — Pinata IPFS client
├── types/                — TypeScript types (index, organizer, web3, supabase)
└── auth.ts               — NextAuth v5 SIWE configuration
```

---

## Environment Variables

Create a `.env.local` file in the root:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# NextAuth
NEXTAUTH_SECRET=your-secret  # generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_ID=your-walletconnect-project-id

# Alchemy
ALCHEMY_API_KEY=your-alchemy-api-key
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key

# Pinata IPFS
PINATA_JWT=your-pinata-jwt

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# OpenAI
OPENAI_API_KEY=sk-proj-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin
ADMIN_WALLET_ADDRESS=0xYourAdminWalletAddress

# Smart Contract (placeholder only — real address comes from Supabase)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# AI Mode (set to true in production to use real OpenAI)
NEXT_PUBLIC_USE_REAL_AI=false

# Hardhat (local dev only — NEVER add to Vercel)
PRIVATE_KEY=0x_your_metamask_private_key
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Sepolia testnet ETH ([faucet](https://sepoliafaucet.com))

### Installation
```bash
git clone https://github.com/yourusername/chainkuns.git
cd chainkuns
npm install
```

### Smart Contract Setup
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

After deploying, copy the contract address to `NEXT_PUBLIC_CONTRACT_ADDRESS` and copy the ABI + bytecode from `artifacts/contracts/EventTicket.sol/EventTicket.json` into `lib/web3/contract.ts`.

> **Important:** Every time you change `EventTicket.sol`, you must recompile and update `CONTRACT_BYTECODE` in `lib/web3/contract.ts`. Failure to do so causes on-chain transaction reverts.

### Running Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Building for Production
```bash
npm run build
npm run start
```

---

## Database Setup (Supabase)

### Tables

| Table | Description |
|-------|-------------|
| `users` | Wallet addresses registered via SIWE |
| `organizer_profiles` | Organizer applications and approval status |
| `events` | Event records with contract addresses |
| `tickets` | Minted NFT tickets synced from blockchain |
| `listings` | Resale marketplace listings |

### RLS Policies

All write operations use the `service_role` key via Server Actions — never the anon key. Key policies:

- `tickets` insert/update — `service_role` only
- `listings` insert/update — `service_role` only
- `users` read/write — `service_role` only
- `events` read — public (active events only)
- `organizer_profiles` read — public

### Storage Buckets

- `banners` — event banner images (public read)

---

## Security Model

**Defense in depth — 5 layers:**

1. **SIWE Auth** — wallet ownership proven cryptographically on login, nonce-based to prevent replay attacks
2. **Server Actions** — all mutations run server-side, wallet address always from JWT session never client input
3. **Zod Validation** — all inputs validated before any DB operation
4. **Rate Limiting** — Upstash Redis rate limiters on all sensitive routes
5. **Supabase RLS** — service role only on all write operations, anon key cannot write tickets or listings
6. **Smart Contract** — final source of truth, ownership enforced on-chain, ReentrancyGuard on all payable functions

**Key security patterns:**
- `owner_wallet` and `seller_wallet` always come from server session, never from client
- Idempotency keys on mint and buy operations prevent double-processing
- `cancelListing` requires on-chain tx first, then Supabase sync
- Pre-validation before MetaMask popup — invalid tickets rejected before spending gas

---

## Smart Contract

`EventTicket.sol` is an ERC-721 contract deployed fresh per event.

**Constructor arguments:**
- `name` — NFT collection name (event title)
- `symbol` — NFT symbol (first 4 chars of title)
- `ticketPrice` — price in wei
- `maxSupply` — total tickets available
- `royaltyPercent` — % organizer earns on resales (max 10%)
- `organizer` — organizer wallet address

**Key functions:**
- `mintTicket(address to, string uri)` — payable, mints NFT to buyer
- `listTicket(uint256 tokenId, uint256 price)` — lists ticket for resale
- `buyTicket(uint256 tokenId)` — payable, transfers NFT and splits ETH
- `cancelListing(uint256 tokenId)` — removes listing
- `useTicket(uint256 tokenId)` — marks ticket as used at door
- `pause()` / `unpause()` — organizer can pause sales

---

## Key Learnings & Gotchas

- `CONTRACT_BYTECODE` in `lib/web3/contract.ts` must be manually updated after **any** Solidity changes
- `NEXT_PUBLIC_CONTRACT_ADDRESS` is a placeholder only — real address always comes from `events.contract_address` in Supabase
- Next.js 15+ dynamic route params must be awaited as `Promise<{ id: string }>`
- Number inputs stored as `string` in React state, converted only on submit to avoid NaN bugs
- Rate limiters use `fixedWindow` not `slidingWindow` — keys expire properly in Redis
- `useOptimistic` in React 19 reverts automatically if the async action fails
- Wagmi momentarily loses connection state on page reload — disconnect logic must check for `reconnecting` status

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Set `NEXT_PUBLIC_USE_REAL_AI=true` for production
5. Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to your Vercel URL
6. Set domain allowlist on [Alchemy dashboard](https://dashboard.alchemy.com)
7. Set allowed origins on [WalletConnect dashboard](https://cloud.walletconnect.com)
8. Register Alchemy Webhook pointing to `https://yourdomain.com/api/webhooks/alchemy`
9. Deploy

---

## License

MIT

---

Built by Kevinkun — Samarinda, Indonesia 🇮🇩