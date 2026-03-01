import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="section-container py-24 flex flex-col items-center text-center gap-8">
        {/* Big 404 number */}
        <div className="relative">
          <p className="font-display font-bold text-[12rem] leading-none text-bg-elevated select-none">
            404
          </p>
          {/* Floating ticket over the 404 */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="text-6xl animate-float">🎟️</span>
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3 max-w-md">
          <h1 className="section-heading text-text-primary">
            Ticket <span className="gradient-text">Not Found</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Looks like this page doesn't exist or the event has been cancelled.
            Head back and find something amazing.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/" className="btn-primary btn-lg">
            Back to Home
          </Link>
          <Link href="/events" className="btn-secondary btn-lg">
            Browse Events
          </Link>
        </div>

        {/* Subtle error code */}
        <p className="mono-text text-xs text-text-secondary">
          Error 404 — Page not found
        </p>
      </div>
    </div>
  );
}
