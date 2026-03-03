"use server";

import { auth } from "@/auth";

import { OrganizerActionResult } from "@/types/organizer";
import { createClient } from "@/lib/supabase/server";
import { generalRateLimiter, checkRateLimit } from "@/lib/ratelimit";
import { OrganizerRegistrationSchema } from "@/lib/validations/organizer.schema";

// Action to handle organizer registration form submission
export async function registerOrganizer(
  formData: unknown,
): Promise<OrganizerActionResult> {
  // 1. CHECK — is the user logged in?
  const session = await auth();
  if (!session?.user?.address) {
    return { success: false, error: "You must connect your wallet first." };
  }

  // 2. RATE LIMIT — prevent spam submissions
  await checkRateLimit(generalRateLimiter, session.user.address);

  // 3. VALIDATE — run Zod schema on the form data
  const parsed = OrganizerRegistrationSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  
  const supabase = await createClient();

  // 4. CHECK — did this user already apply?
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", session.user.address)
    .single();

  if (!existingUser) {
    return { success: false, error: "User not found. Please sign in again." };
  }

  const { data: existingProfile } = await supabase
    .from("organizer_profiles")
    .select("id")
    .eq("user_id", existingUser.id)
    .single();

  if (existingProfile) {
    return {
      success: false,
      error: "You have already applied as an organizer.",
    };
  }

  // 5. INSERT — save the organizer profile (is_verified defaults to false)
  const { error: insertError } = await supabase
    .from("organizer_profiles")
    .insert({
      user_id: existingUser.id,
      display_name: parsed.data.display_name,
      bio: parsed.data.bio,
      logo_url: parsed.data.logo_url ?? null,
    });

  if (insertError) {
    return {
      success: false,
      error: "Failed to submit application. Please try again.",
    };
  }

  return {
    success: true,
    message: "Application submitted! We'll review it shortly.",
  };
}


// Admin actions to approve/reject organizers. 
// Only accessible to the admin wallet defined in env vars.
export async function approveOrganizer(
  organizerProfileId: string,
): Promise<OrganizerActionResult> {
  // 1. CHECK — is the user the admin?
  const session = await auth();
  if (
    session?.user?.address?.toLowerCase() !==
    process.env.ADMIN_WALLET_ADDRESS?.toLowerCase()
  ) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("organizer_profiles")
    .update({ status: "approved" })
    .eq("id", organizerProfileId);

  if (error) {
    return { success: false, error: "Failed to approve organizer." };
  }

  return { success: true, message: "Organizer approved." };
}

// Admin action to reject an organizer application
export async function rejectOrganizer(
  organizerProfileId: string,
): Promise<OrganizerActionResult> {
  // 1. CHECK — is the user the admin?
  const session = await auth();
  if (
    session?.user?.address?.toLowerCase() !==
    process.env.ADMIN_WALLET_ADDRESS?.toLowerCase()
  ) {
    return { success: false, error: "Unauthorized." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("organizer_profiles")
    .update({ status: "rejected" })
    .eq("id", organizerProfileId);

  if (error) {
    return { success: false, error: "Failed to reject organizer." };
  }

  return { success: true, message: "Application rejected." };
}
