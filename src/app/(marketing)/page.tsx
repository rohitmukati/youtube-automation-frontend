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
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Trust />
      <Faq />
      <FinalCta />
    </>
  );
}
