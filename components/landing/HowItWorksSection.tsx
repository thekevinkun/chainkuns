import { STEPS } from "@/lib/constants";

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-bg-surface border-y border-border">
      <div className="section-container">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="section-heading text-text-primary mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            From browsing to the event door — everything happens on-chain.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative flex flex-col gap-4">
              {/* Connector line between steps — hidden on last step */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(50%+2rem)] w-full h-px bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="flex md:flex-col items-center md:items-start gap-4">
                {/* Step number circle */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-from to-accent-to flex items-center justify-center font-display font-bold text-white text-lg shrink-0">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="text-3xl">{step.icon}</div>

                {/* Title */}
                <h3 className="font-display font-bold text-text-primary text-lg">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
