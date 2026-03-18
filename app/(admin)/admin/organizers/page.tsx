import type { Metadata } from "next";
import { AdminOrganizers } from "@/components/organizer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Organizer Applications — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOrganizersPage() {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("organizer_profiles")
    .select(
      `
      id,
      display_name,
      bio,
      logo_url,
      status,
      created_at,
      users ( wallet_address )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return <AdminOrganizers applications={applications ?? []} />;
}
