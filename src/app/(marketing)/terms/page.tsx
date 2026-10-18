import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";
import { siteConfig } from "@/config/site";
import { termsSections } from "@/features/legal/terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that apply when you use ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="Please read these terms before using the service. They explain what you can expect from us and what we expect from you."
      sections={termsSections}
    />
  );
}
