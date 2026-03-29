import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: {
    default: "Organizer Dashboard | Chainkuns",
    template: "%s | Chainkuns", // individual pages add their title before the pipe
  },
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

  // Organizer status is already attached in the NextAuth session.
  // Reuse it here instead of relying on a separate Supabase anon client lookup.
  if (!session.user.organizerStatus) {
    redirect("/organizer/register");
  }

  // Applied but not approved yet
  if (session.user.organizerStatus === "pending") {
    redirect("/organizer/pending");
  }

  // Rejected
  if (session.user.organizerStatus === "rejected") {
    redirect("/organizer/rejected");
  }

  return <>{children}</>;
}
