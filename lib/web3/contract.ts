// ============================================
// Contract Config — Chainkuns
// Holds the deployed EventTicket.sol address and ABI
// ABI tells the frontend which functions exist on the contract
//
// The ABI comes from: contracts/artifacts/contracts/EventTicket.sol/EventTicket.json
// ============================================

// Deployed contract address on Sepolia — set after Phase 1 deployment
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "") as `0x${string}`; // viem requires this exact type for all addresses

// Contract ABI — the interface between our frontend and the smart contract
// Replace this with the real ABI after Phase 1 deployment
export const CONTRACT_ABI = [
  // ── READ functions (free — just reading from blockchain) ──

  // How much ETH one ticket costs
  {
    name: "ticketPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256", name: "" }],
  },

  // Max number of tickets that can ever be minted for this event
  {
    name: "maxSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256", name: "" }],
  },

  // Royalty percentage the organizer earns on every resale
  {
    name: "royaltyPercent",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256", name: "" }],
  },

  // Is a specific ticket currently listed for resale?
  {
    name: "isListed",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "tokenId" }],
    outputs: [{ type: "bool", name: "" }],
  },

  // What price is a listed ticket listed at (in wei)?
  {
    name: "listingPrice",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "tokenId" }],
    outputs: [{ type: "uint256", name: "" }],
  },

  // ── WRITE functions (cost gas — user pays ETH) ──

  // Mint a new ticket NFT — user sends ETH equal to ticketPrice
  {
    name: "mintTicket",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { type: "address", name: "to" }, // recipient wallet
      { type: "string", name: "uri" }, // IPFS metadata URI
    ],
    outputs: [],
  },

  // List a ticket for resale at a given price in wei
  {
    name: "listTicket",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "tokenId" },
      { type: "uint256", name: "price" },
    ],
    outputs: [],
  },

  // Buy a listed ticket — buyer sends ETH equal to the listing price
  {
    name: "buyTicket",
    type: "function",
    stateMutability: "payable",
    inputs: [{ type: "uint256", name: "tokenId" }],
    outputs: [],
  },

  // Return a ticket to the platform for a partial refund
  {
    name: "sellBack",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "tokenId" }],
    outputs: [],
  },

  // Mark a ticket as used at the door — only organizer can call this
  {
    name: "useTicket",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "tokenId" }],
    outputs: [],
  },

  // Pause the contract — emergency stop if something goes wrong
  {
    name: "pause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },

  // Resume the paused contract
  {
    name: "unpause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },

  // ── EVENTS (logs emitted by the contract) ──

  // Emitted when a ticket is minted — frontend listens for this
  {
    name: "TicketMinted",
    type: "event",
    inputs: [
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "tokenId", indexed: true },
      { type: "string", name: "uri", indexed: false },
    ],
  },

  // Emitted when a ticket is listed for resale
  {
    name: "TicketListed",
    type: "event",
    inputs: [
      { type: "uint256", name: "tokenId", indexed: true },
      { type: "uint256", name: "price", indexed: false },
      { type: "address", name: "seller", indexed: true },
    ],
  },

  // Emitted when a listed ticket is purchased
  {
    name: "TicketSold",
    type: "event",
    inputs: [
      { type: "uint256", name: "tokenId", indexed: true },
      { type: "address", name: "buyer", indexed: true },
      { type: "uint256", name: "price", indexed: false },
    ],
  },

  // Emitted when a ticket is scanned and marked as used at the door
  {
    name: "TicketUsed",
    type: "event",
    inputs: [{ type: "uint256", name: "tokenId", indexed: true }],
  },
] as const; // "as const" makes TypeScript infer exact literal types from the ABI
