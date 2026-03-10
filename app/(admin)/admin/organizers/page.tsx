import type { Metadata } from "next";
import { OrganizerApprovalCard } from "@/components/organizer";
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

  if (!applications || applications.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">No Pending Applications</h1>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section-container mx-auto py-24 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Organizer Applications</h1>
        <p className="text-muted-foreground">{applications.length} pending</p>
      </div>

      <div className="space-y-4">
        {applications.map((application) => (
          <OrganizerApprovalCard
            key={application.id}
            application={application}
          />
        ))}
      </div>
    </main>
  );
}
