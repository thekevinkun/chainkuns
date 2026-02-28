// Utility functions for formatting ETH, wallet addresses, and dates
// Used across the whole app for consistent display

// Formats a raw ETH number for display (e.g. 0.05 → "0.05 ETH")
export function formatEth(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount; // handle both string and number input
  return `${parseFloat(num.toFixed(4))} ETH`; // show up to 4 decimal places, strip trailing zeros
}

// Shortens a wallet address for display (e.g. 0x1234567890abcdef → 0x1234...cdef)
export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length < 10) return address; // return as-is if too short to shorten
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`; // keep start and end, hide middle
}

// Formats a transaction hash the same way as a wallet address
export function formatTxHash(hash: string, chars: number = 6): string {
  return formatAddress(hash, chars); // reuse formatAddress since tx hashes are also long hex strings
}

// Formats an ISO date string to a human-friendly event date
// e.g. "2026-03-15T18:00:00Z" → "March 15, 2026 at 6:00 PM"
export function formatEventDate(isoString: string): string {
  const date = new Date(isoString); // parse the ISO string into a Date object
  return (
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

// Short date format for cards (e.g. "Mar 15, 2026")
export function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Returns how far away an event is (e.g. "3 days away", "Tomorrow", "Event passed")
export function formatTimeUntil(isoString: string): string {
  const diffMs = new Date(isoString).getTime() - Date.now(); // milliseconds until event
  if (diffMs <= 0) return "Event passed"; // event already happened
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // convert ms to days
  const hours = Math.floor(diffMs / (1000 * 60 * 60)); // convert ms to hours
  if (days > 1) return `${days} days away`;
  if (days === 1) return "Tomorrow";
  if (hours > 1) return `${hours} hours away`;
  return "Today";
}

// Formats large numbers with commas (e.g. 10000 → "10,000")
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

// Converts an ipfs:// URI to a browser-accessible HTTP URL
// e.g. ipfs://Qm... → https://ipfs.io/ipfs/Qm...
export function ipfsToHttp(
  ipfsUri: string,
  gateway: string = "https://ipfs.io",
): string {
  if (!ipfsUri) return ""; // return empty string if no URI provided
  if (ipfsUri.startsWith("http")) return ipfsUri; // already an HTTP URL, no conversion needed
  return ipfsUri.replace("ipfs://", `${gateway}/ipfs/`); // swap ipfs:// for the gateway URL
}

// Returns the Sepolia Etherscan URL for a transaction hash
export function getTxUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`; // link to transaction on block explorer
}

// Returns the Sepolia Etherscan URL for a wallet or contract address
export function getAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`; // link to address on block explorer
}
