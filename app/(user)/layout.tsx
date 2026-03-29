import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check the user is logged in via SIWE
  const session = await auth();

  // No session — kick them to home page
  if (!session?.user?.address) {
    redirect("/");
  }

  // Signed in — render the page
  return <>{children}</>;
}
