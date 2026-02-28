# Chainkuns — The Future of Event Ticketing is On-Chain

> AI-powered Web3 event ticketing platform. Portfolio project demonstrating full-stack Web3 development.

**Status:** Phase 0 complete ✅ — Project setup & design system

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions, `"use cache"`) |
| Frontend | React 19, TypeScript (strict), Tailwind v4 |
| Smart Contract | Solidity 0.8.28+, Hardhat, OpenZeppelin |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Web3 | Wagmi 2.x, Viem, RainbowKit |
| Auth | NextAuth v5 + SIWE (Sign In With Ethereum) |
| Storage | Pinata (IPFS) |
| AI | OpenAI GPT-4 (event description generation) |
| Monitoring | Sentry |

---

## Project Setup

### Prerequisites
- Node.js 18+
- MetaMask wallet with Sepolia test ETH
- Accounts: Supabase, Alchemy, Pinata, Upstash, OpenAI, Sentry

### Installation

```bash
# Clone and install
git clone <repo>
cd chainkuns
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Phase Progress

- [x] **Phase 0** — Project setup, design system, UI components
- [ ] **Phase 1** — Smart contract (EventTicket.sol) + Sepolia deployment
- [ ] **Phase 2** — Supabase schema + SIWE authentication
- [ ] **Phase 3** — Public pages (landing, browse events, event detail)
- [ ] **Phase 4** — Organizer flow (create event, deploy contract, AI description)
- [ ] **Phase 5** — User flow (buy ticket, My Tickets, QR code)
- [ ] **Phase 6** — Resale marketplace
- [ ] **Phase 7** — AI integration (GPT-4 event descriptions)
- [ ] **Phase 8** — Polish, security audit, Vercel deployment

---

## Folder Structure

```
chainkuns/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # No auth required
│   ├── (organizer)/        # Organizer auth required
│   ├── (user)/             # Wallet required
│   └── api/                # Route handlers
├── components/
│   ├── ui/                 # Pure reusable components
│   ├── layout/             # Header, Footer, Providers
│   ├── web3/               # Wallet-specific components
│   ├── events/             # Event feature components
│   ├── tickets/            # Ticket display components
│   └── organizer/          # Organizer dashboard components
├── lib/
│   ├── supabase/           # Database clients
│   ├── web3/               # Wagmi config, contract ABI
│   ├── validations/        # Zod schemas (shared frontend/backend)
│   └── utils/              # cn(), format helpers
├── types/                  # TypeScript interfaces
├── contracts/              # Solidity smart contracts
└── styles/                 # Tailwind v4 design system
```

---

## Design System

**Brand:** CHAIN (gradient violet→cyan) + kuns (white) — dark mode only

**Colors:**
- Background: `#0a0f0f` (base) → `#111918` (surface) → `#1a2421` (elevated)
- Accent: `#7c3aed` (violet) → `#00d4aa` (cyan) gradient
- Text: `#ffffff` primary, `#8a9a95` secondary, `#00d4aa` mono

**Fonts:**
- Display: Syne (hero headings)
- Body: Inter (body text)
- Mono: JetBrains Mono (addresses, hashes, prices)

---

## Security

- ✅ Zod validation on all forms + Server Actions
- ✅ Rate limiting via Upstash Redis
- ✅ Idempotency keys to prevent double-minting
- ✅ SIWE authentication (wallet-based, no passwords)
- ✅ Supabase RLS on all tables
- ✅ Environment variable split (server vs browser)
- ✅ TypeScript strict mode (zero `any`)
- ✅ Smart contract: ReentrancyGuard + Pausable + Check-Effects-Interactions

---

## Smart Contract Architecture

One `EventTicket.sol` deployed per event (Contract Factory Pattern):

1. Organizer creates event → platform deploys fresh contract
2. Users mint tickets (`mintTicket`) → NFT minted to wallet
3. Owners can list for resale (`listTicket`) 
4. Buyers purchase listed tickets (`buyTicket`) → ETH split with royalty to organizer
5. Sell back to platform (`sellBack`)
6. Staff validates ticket at door (`useTicket`)

---

*Portfolio project by [Developer]. Not for commercial use.*
