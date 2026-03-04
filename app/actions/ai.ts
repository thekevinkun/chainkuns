// ============================================
// AI Server Actions — Chainkuns
// Handles AI-powered event description generation.
// Runs on the SERVER — OpenAI key never exposed to browser.
// ============================================

"use server";

import { auth } from "@/auth";
import { openai } from "@/lib/openai";
import { aiGenerateRateLimiter, checkRateLimit } from "@/lib/ratelimit"; // rate limiter — 5 per hour per organizer

// The shape of what this action returns
export type AIActionResult =
  | { success: true; description: string } // success — returns generated description
  | { success: false; error: string }; // failure — returns error message

// generateEventDescription — Server Action
// Takes basic event info, returns a polished description
// Rate limited to 5 per hour per organizer
export async function generateEventDescription({
  title,
  venue,
  date,
}: {
  title: string; // event name — used to set the tone
  venue: string; // location — adds context
  date: string; // event date — adds urgency
}): Promise<AIActionResult> {
  // 1. CHECK — is the user logged in?
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "You must connect your wallet first." };
  }

  // 2. RATE LIMIT — max 5 AI generations per hour per organizer
  await checkRateLimit(aiGenerateRateLimiter, session.user.address);

  // 3. VALIDATE — make sure we have enough info to generate a good description
  if (!title || title.length < 3) {
    return { success: false, error: "Please enter an event title first." };
  }
  if (!venue || venue.length < 2) {
    return { success: false, error: "Please enter a venue first." };
  }
  if (!date) {
    return { success: false, error: "Please enter an event date first." };
  }

  // CHECK — is real AI enabled?
  // Set NEXT_PUBLIC_USE_REAL_AI=true in production only
  const USE_REAL_AI = process.env.NEXT_PUBLIC_USE_REAL_AI === "true";

  if (!USE_REAL_AI) {
    // Return a mock description for development
    return {
      success: true,
      description: `${title} is coming to ${venue} on ${new Date(
        date,
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}. This is an unforgettable experience you don't want to miss. Secure your NFT ticket today and be part of something extraordinary. Limited supply available — once they're gone, they're gone.`,
    };
  }

  // Real AI — only runs when NEXT_PUBLIC_USE_REAL_AI=true
  try {
    // 4. CALL OpenAI — generate a professional event description
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap — good enough for descriptions
      max_tokens: 500, // keep descriptions concise
      messages: [
        {
          role: "system", // sets the AI's behavior
          content:
            "You are an expert event copywriter. Write compelling, professional event descriptions that excite potential attendees. Keep it under 300 words. No hashtags. No emojis. Plain text only.",
        },
        {
          role: "user", // the actual request
          content: `Write a professional event description for:
                Event: ${title}
                Venue: ${venue}
                Date: ${new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            Write only the description. No title. No extra formatting.`,
        },
      ],
    });

    // 5. EXTRACT — get the text from the response
    const description = completion.choices[0]?.message?.content?.trim();

    if (!description) {
      return {
        success: false,
        error: "AI failed to generate a description. Please try again.",
      };
    }

    return { success: true, description }; // return the generated description
  } catch (error) {
    console.error("OpenAI error:", error);
    return { success: false, error: "AI generation failed. Please try again." };
  }
}
