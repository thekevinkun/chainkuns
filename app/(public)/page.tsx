import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  StatsSection,
  FooterCTA,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <FooterCTA />
    </div>
  );
}
