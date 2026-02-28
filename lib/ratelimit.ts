// ============================================
// Rate Limiting — Chainkuns
// Uses Upstash Redis to limit how many times
// someone can call expensive operations
// Prevents abuse, spam, and high OpenAI costs
// ============================================

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create the Redis client using our Upstash credentials
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "", // Upstash REST URL from env
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "", // Upstash token from env
});

// ── Rate Limiters ──────────────────────────────────────────────────

// Mint ticket — 3 per hour per wallet address
// Prevents one person from buying all tickets instantly
export const mintRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 attempts per 1 hour window
  prefix: "chainkuns:mint", // Redis key prefix to separate from other limiters
  analytics: true, // track usage in Upstash dashboard
});

// Create event — 3 per day per organizer
// Prevents organizers from spamming fake events
export const createEventRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 d"), // 3 events per day
  prefix: "chainkuns:create-event",
  analytics: true,
});

// AI description generation — 5 per hour per IP
// Each OpenAI call costs money so we keep this tight
export const aiGenerateRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 generations per hour
  prefix: "chainkuns:ai-generate",
  analytics: true,
});

// General API — 100 per minute per IP
// Catch-all for all other routes
export const generalRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  prefix: "chainkuns:general",
  analytics: true,
});

// ── Helper Function ────────────────────────────────────────────────

// Call this at the top of any Server Action to check the rate limit
// Pass the wallet address or IP address as the identifier
// Throws an error if the limit is exceeded — stops the action immediately
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
): Promise<void> {
  const result = await limiter.limit(identifier); // check against Redis

  if (!result.success) {
    // Calculate how many seconds until they can try again
    const resetInSeconds = Math.ceil((result.reset - Date.now()) / 1000);
    throw new Error(
      `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
    );
  }
}
