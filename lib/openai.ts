// ============================================
// OpenAI Client — Chainkuns
// Single shared OpenAI instance for the entire app.
// Only used server-side — API key never exposed to browser.
// ============================================

import OpenAI from "openai";

// Create a single shared OpenAI client instance
// API key comes from .env.local — never expose to browser
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // server-only env variable (no NEXT_PUBLIC_ prefix)
});
