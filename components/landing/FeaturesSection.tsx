import { FEATURES } from "@/lib/constants";

const FeaturesSection = () => {
  return (
    <section className="section-container py-24">
      {/* Section heading */}
      <div className="text-center mb-16">
        <h2 className="section-heading text-text-primary mb-4">
          Why <span className="gradient-text">On-Chain</span> Ticketing?
        </h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Traditional ticketing is broken. Scalpers, fraud, zero royalties.
          <br />
          Chainkuns fixes all of it with blockchain technology.
        </p>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className="card-surface p-6 flex flex-col gap-4 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-violet/20 to-accent-cyan/20 border border-border flex items-center justify-center text-2xl">
              {feature.icon}
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-text-primary text-lg">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-text-secondary text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
