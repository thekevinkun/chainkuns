import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Application Rejected",
  robots: { index: false, follow: false },
};

export default function OrganizerRejectedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-5xl">❌</div>
        <h1 className="text-2xl font-bold">Application Rejected</h1>
        <p className="text-muted-foreground">
          Unfortunately your organizer application was not approved. If you
          believe this is a mistake, please contact us.
        </p>
        <Link href="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    </main>
  );
}
