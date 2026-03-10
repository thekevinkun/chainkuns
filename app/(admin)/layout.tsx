import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }, // don't let search engines index admin pages
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const isAdmin =
    session?.user?.address?.toLowerCase() ===
    process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();

  if (!isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}
