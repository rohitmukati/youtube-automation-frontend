import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";
import { siteConfig } from "@/config/site";
import { privacySections } from "@/features/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your information.`,
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="We keep this short and plain. Here is what we collect, why we collect it, and how you stay in control."
      sections={privacySections}
    />
  );
}
