import { AiInsights, GrowthTools } from "@/components/marketing/landing-showcase";
import {
  Faq,
  Features,
  FinalCta,
  Hero,
  HowItWorks,
  Trust,
} from "@/components/marketing/landing-sections";

export default function LandingPage() {
  return (
    <div className="landing-ambient">
      <Hero />
      <Features />
      <AiInsights />
      <GrowthTools />
      <HowItWorks />
      <Trust />
      <Faq />
      <FinalCta />
    </div>
  );
}