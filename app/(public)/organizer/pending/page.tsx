import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Application Pending",
  robots: { index: false, follow: false },
};

export default function OrganizerPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold">Application Under Review</h1>
        <p className="text-muted-foreground">
          Your organizer application is being reviewed by our team. We'll notify
          you once it's approved.
        </p>
        <Link href="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    </main>
  );
}
