import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Organizer Dashboard — Chainkuns",
  robots: { index: false, follow: false },
};

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not logged in — go connect wallet first
  if (!session?.user?.address) {
    redirect("/");
  }

  const supabase = await createClient();

  // Check if this wallet has a verified organizer profile
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", session.user.address)
    .single();

  if (!user) {
    redirect("/");
  }

  // Get organizer profile status
  const { data: profile } = await supabase
    .from("organizer_profiles")
    .select("status")
    .eq("user_id", user.id)
    .single();

  // No profile at all — send to apply page
  if (!profile) {
    redirect("/organizer/register");
  }

  // Applied but not approved yet
  if (profile.status === "pending") {
    redirect("/organizer/pending");
  }

  // Rejected
  if (profile.status === "rejected") {
    redirect("/organizer/rejected");
  }

  return <>{children}</>;
}
