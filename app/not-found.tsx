import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return (
    <div className="section-container py-32 text-center">
      {/* Big 404 in gradient */}
      <p className="font-display font-bold text-8xl gradient-text mb-4">404</p>

      <h1 className="font-display font-bold text-2xl text-text-primary mb-4">
        This ticket doesn&apos;t exist
      </h1>

      <p className="text-text-secondary mb-10 max-w-md mx-auto">
        The page you&apos;re looking for has been burned, transferred, or never
        existed on-chain.
      </p>

      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
