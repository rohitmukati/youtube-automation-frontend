import { siteConfig } from "@/config/site";
import type { LegalSection } from "@/features/legal/types";

const name = siteConfig.name;

export const termsSections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    blocks: [
      {
        type: "p",
        text: `These Terms of Service ("Terms") form an agreement between you and ${name} ("we", "us"). By creating an account or using the service you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the service.`,
      },
    ],
  },
  {
    id: "the-service",
    title: "The service",
    blocks: [
      {
        type: "p",
        text: `${name} lets you connect YouTube channels that you own or are authorised to manage, store media in a private library, and publish videos to several channels at once. Features may change, and we may add or remove functionality over time.`,
      },
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility and your account",
    blocks: [
      {
        type: "ul",
        items: [
          "You must be at least 16 years old, and old enough to form a binding contract where you live.",
          "You must provide accurate information and keep your login details confidential.",
          "You are responsible for all activity under your account. Tell us promptly if you suspect unauthorised use.",
        ],
      },
    ],
  },
  {
    id: "youtube",
    title: "YouTube and Google",
    blocks: [
      {
        type: "ul",
        items: [
          "The service uses YouTube API Services. By using it you also agree to be bound by the YouTube Terms of Service (https://www.youtube.com/t/terms) and the Google Privacy Policy (https://policies.google.com/privacy).",
          "You may connect only channels you own or have permission to manage, and you must comply with YouTube's policies, including its Community Guidelines and copyright rules.",
          "You can revoke our access to your Google account at any time through your Google Account permissions page.",
          `${name} is an independent service and is not affiliated with, sponsored by or endorsed by YouTube or Google.`,
        ],
      },
    ],
  },
  {
    id: "your-content",
    title: "Your content",
    blocks: [
      {
        type: "p",
        text: "You keep all rights in the videos, images and text you upload. You give us a limited licence to store, process and transmit your content solely to operate the service, including uploading it to the channels you select.",
      },
      {
        type: "p",
        text: "You are solely responsible for your content and for having all rights and permissions needed to publish it. We do not review your content before it is published and are not responsible for it.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    blocks: [
      { type: "p", text: "You agree not to:" },
      {
        type: "ul",
        items: [
          "upload content that is unlawful, infringing, deceptive, harmful or that violates YouTube's policies;",
          "use the service to spam, to manipulate views, likes or subscribers, or to evade YouTube's limits or enforcement;",
          "attempt to access accounts, data or systems that are not yours, or to disrupt or overload the service;",
          "reverse engineer the service, or use automated means to access it other than through features we provide;",
          "resell or sublicense the service without our written permission.",
        ],
      },
    ],
  },
  {
    id: "limits",
    title: "Usage limits and availability",
    blocks: [
      {
        type: "p",
        text: "We apply daily upload limits and file size limits, which are shown in the app and may change. YouTube also applies its own quotas and rules to every channel, and uploads can fail or be delayed because of them. We work to keep the service available but do not guarantee uninterrupted or error-free operation.",
      },
    ],
  },
  {
    id: "termination",
    title: "Suspension and termination",
    blocks: [
      {
        type: "p",
        text: "You may stop using the service at any time and can disconnect your accounts and delete your files from within the app. We may suspend or end your access if you breach these Terms, if required by law or by Google or YouTube, or to protect the service and its users.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "Our intellectual property",
    blocks: [
      {
        type: "p",
        text: `The service, including its software, design and branding, belongs to ${name} and its licensors. These Terms do not grant you any rights in them except the right to use the service as described.`,
      },
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    blocks: [
      {
        type: "p",
        text: 'The service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose and non-infringement, to the fullest extent permitted by law. We do not warrant that uploads will always succeed or that the service will meet your requirements.',
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    blocks: [
      {
        type: "p",
        text: `To the fullest extent permitted by law, ${name} will not be liable for any indirect, incidental, special, consequential or punitive damages, or for lost profits, data or goodwill, arising from your use of the service. Our total liability for any claim relating to the service is limited to the greater of the amount you paid us in the twelve months before the claim or USD 100.`,
      },
    ],
  },
  {
    id: "indemnity",
    title: "Indemnity",
    blocks: [
      {
        type: "p",
        text: "You agree to defend and indemnify us against claims, losses and expenses, including reasonable legal fees, arising from your content, your use of the service, or your breach of these Terms or of third-party rights.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    blocks: [
      {
        type: "p",
        text: "We may update these Terms from time to time. We will post the new version here and update the date above. If you keep using the service after a change takes effect, you accept the updated Terms.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "Governing law",
    blocks: [
      {
        type: "p",
        text: "These Terms are governed by the laws of the jurisdiction in which our operating entity is established, without regard to conflict of law rules. Courts in that jurisdiction have exclusive authority over disputes, except where local consumer law gives you the right to bring a claim elsewhere.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      { type: "p", text: `Questions about these Terms? Email us at ${siteConfig.supportEmail}.` },
    ],
  },
];
