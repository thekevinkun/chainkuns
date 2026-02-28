import Link from "next/link";

export default function HomePage() {
  return (
    <div className="section-container">
      {/* ── Hero Section ── */}
      <section className="py-24 md:py-32 text-center">
        {/* Status badge — shows the project is live on testnet */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-bg-surface mb-8">
          <span
            className="w-2 h-2 rounded-full bg-success animate-pulse"
            aria-hidden="true"
          />
          <span className="text-xs text-text-secondary font-mono">
            Live on Sepolia Testnet
          </span>
        </div>

        {/* Main headline */}
        <h1 className="hero-heading mb-6">
          The Future of <br />
          <span className="gradient-text">Event Ticketing</span>
          <br />
          is On-Chain.
        </h1>

        {/* Subheadline */}
        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Buy tickets as NFTs. Earn royalties on every resale. Verify attendees
          with a wallet scan. No middlemen. No fraud.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/events" className="btn-primary btn-lg">
            Browse Events
          </Link>
          <Link href="/organizer/register" className="btn-secondary btn-lg">
            Create an Event
          </Link>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-16 border-y border-border">
        {[
          { label: "Events Created", value: "—" },
          { label: "Tickets Minted", value: "—" },
          { label: "Avg Royalty", value: "5%" },
          { label: "Network", value: "Sepolia" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display font-bold text-3xl gradient-text">
              {stat.value}
            </p>
            <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ── How It Works ── */}
      <section className="py-24">
        <h2 className="section-heading text-center mb-16">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Organizer Creates Event",
              desc: "A smart contract is deployed specifically for your event.",
            },
            {
              step: "02",
              title: "Fans Buy Tickets",
              desc: "Each ticket is minted as a unique NFT directly to the buyer's wallet.",
            },
            {
              step: "03",
              title: "Peer-to-Peer Resale",
              desc: "Owners can resell tickets. Organizers earn royalties automatically.",
            },
            {
              step: "04",
              title: "Verify at the Door",
              desc: "QR code scanned, contract marks ticket as used. No fraud possible.",
            },
          ].map((item) => (
            <div key={item.step} className="card-surface p-6 text-center">
              <div className="mono-text text-3xl font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-display font-semibold text-lg mb-3">
                {item.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="py-24 text-center">
        <h2 className="section-heading mb-6">Ready to go on-chain?</h2>
        <p className="text-text-secondary mb-10 max-w-md mx-auto">
          Connect your wallet and explore events or create your own.
        </p>
        <Link href="/events" className="btn-primary btn-lg">
          Explore Events →
        </Link>
      </section>
    </div>
  );
}
