import Link from "next/link";

const FooterCTA = () => {
  return (
    <section className="py-24 bg-bg-surface border-t border-border">
      <div className="section-container">
        {/* CTA card with gradient border */}
        <div className="gradient-border p-12 text-center flex flex-col items-center gap-6">
          {/* Heading */}
          <h2 className="section-heading text-text-primary max-w-2xl">
            Ready to experience{" "}
            <span className="gradient-text">the future</span> of ticketing?
          </h2>

          {/* Subtext */}
          <p className="text-text-secondary text-lg max-w-xl">
            Join thousands of fans and organizers already using Chainkuns. Your
            first ticket is one wallet connect away.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/events" className="btn-primary btn-lg">
              Browse Events
            </Link>
            <Link href="/organizer/register" className="btn-secondary btn-lg">
              Become an Organizer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
