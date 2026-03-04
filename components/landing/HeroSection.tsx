import Link from "next/link";
import { TicketMockup } from "@/components/landing";

const HeroSection = () => {
  return (
    <section
      id="hero"
      style={{ minHeight: "calc(100vh - 64px)" }}
      className="section-container flex items-center py-10 lg:py-0"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* ── Left: Headline + CTA ── */}
        <div className="animate-fade-in-up">
          {/* Small badge above headline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-bg-surface text-text-secondary text-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            Now live on Sepolia Testnet
          </div>

          {/* Main headline */}
          <h1 className="hero-heading text-text-primary mb-4">
            The Future of <span className="gradient-text">Event Ticketing</span>{" "}
            is On-Chain.
          </h1>

          {/* Subheadline */}
          <p className="text-text-secondary text-lg leading-relaxed mb-8">
            Buy, sell, and verify event tickets as NFTs. Automatic royalties for
            organizers. Zero middlemen. Powered by Ethereum.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link href="/events" className="btn-primary btn-lg">
              Browse Events
            </Link>
            <Link href="/organizer/register" className="btn-secondary btn-lg">
              Become an Organizer
            </Link>
          </div>
        </div>

        {/* ── Right: Floating Ticket Mockup ── */}
        <div className="flex justify-center lg:justify-end animate-fade-in-up animation-delay-200">
          <TicketMockup />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
