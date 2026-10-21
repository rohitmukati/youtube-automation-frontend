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
      <HowItWorks />
      <Trust />
      <Faq />
      <FinalCta />
    </div>
  );
}