import { STATS } from "@/lib/constants";

const StatsSection = () => {
  return (
    <section className="section-container py-24">
      {/* Section heading */}
      <div className="text-center mb-16">
        <h2 className="section-heading text-text-primary mb-4">
          Trusted by <span className="gradient-text">Thousands</span>
        </h2>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Growing every day on Sepolia testnet — and ready for mainnet.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="card-surface p-8 flex flex-col items-center text-center gap-2"
          >
            {/* Icon */}
            <span className="text-3xl mb-2">{stat.icon}</span>

            {/* Number */}
            <p className="font-display font-bold text-4xl gradient-text">
              {stat.value}
            </p>

            {/* Label */}
            <p className="text-text-secondary text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
