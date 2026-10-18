import { siteConfig } from "@/config/site";
import type { LegalSection } from "@/features/legal/types";

const name = siteConfig.name;

export const privacySections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    blocks: [
      {
        type: "p",
        text: `This Privacy Policy explains what information ${name} ("we", "us") collects when you use our website and service, how we use it, and the choices you have. ${name} helps you publish videos to the YouTube channels you manage. By using the service you agree to the practices described here.`,
      },
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    blocks: [
      { type: "p", text: "We collect only what is needed to provide the service." },
      {
        type: "ul",
        items: [
          "Account information: your name, email address, an optional phone number, and your password. Passwords are never stored in plain text.",
          "YouTube and Google account information, when you connect a channel: the Google account email address, your YouTube channel ID, channel title and channel picture, and the OAuth tokens Google issues so that we can act on your behalf.",
          "Content you upload: videos and images you add to Storage, along with their file names, sizes, types and any tags you add.",
          "Upload details: the titles, descriptions, tags, categories, privacy settings, schedules and results of the uploads you start, including per-channel status and error messages.",
          "Technical information: basic request logs such as IP address, browser type and timestamps, used for security, abuse prevention and troubleshooting.",
        ],
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    blocks: [
      {
        type: "ul",
        items: [
          "To create and secure your account, including sending verification codes for password resets.",
          "To connect your YouTube channels and to upload the videos you choose to the channels you select.",
          "To store your media and show you upload history, progress and results.",
          "To enforce usage limits, prevent abuse and keep the service reliable.",
          "To respond to support requests and to meet legal obligations.",
        ],
      },
      {
        type: "p",
        text: "We do not sell your personal information, and we do not use it for advertising.",
      },
    ],
  },
  {
    id: "google-user-data",
    title: "Google and YouTube user data",
    blocks: [
      {
        type: "p",
        text: `${name}'s use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements.`,
      },
      { type: "p", text: "When you connect a YouTube account we request these permissions:" },
      {
        type: "ul",
        items: [
          "Upload videos and manage thumbnails on your YouTube channel (youtube.upload), used only to publish videos you choose to upload.",
          "View basic information about your YouTube account (youtube.readonly), used to show your channel name and picture.",
          "View your email address (userinfo.email), used to show which Google account a channel belongs to.",
        ],
      },
      {
        type: "ul",
        items: [
          "We use Google user data only to provide and improve the features you see in the app.",
          "We do not transfer Google user data to others except as needed to provide the service, to comply with law, or as part of a merger or sale with notice to you.",
          "We do not use Google user data for serving advertisements, and we do not allow humans to read it unless you give consent for specific data, it is necessary for security or to comply with law, or the data is aggregated and used for internal operations.",
          "OAuth tokens are stored encrypted. You can revoke our access at any time from your Google Account permissions page or by disconnecting the account inside the app.",
        ],
      },
      {
        type: "p",
        text: "Our service also uses YouTube API Services. By using it you agree to be bound by the YouTube Terms of Service and the Google Privacy Policy.",
      },
    ],
  },
  {
    id: "sharing",
    title: "How we share information",
    blocks: [
      { type: "p", text: "We share information only in these situations:" },
      {
        type: "ul",
        items: [
          "With Google and YouTube, to authenticate your accounts and upload the content you ask us to publish.",
          "With service providers that host our infrastructure, database, file storage and email delivery, who may process data only on our instructions.",
          "When required by law, or to protect the rights, safety and security of our users or the public.",
        ],
      },
    ],
  },
  {
    id: "retention",
    title: "Retention and deletion",
    blocks: [
      {
        type: "ul",
        items: [
          "Files in Storage remain until you delete them. Deleting a file removes it from your library.",
          "When you disconnect a YouTube account, the stored OAuth tokens for that account are removed and we stop accessing the channel.",
          "Upload history is kept so you can review past results.",
          "To have your account and associated data deleted, contact us at the address below and we will respond promptly.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    blocks: [
      {
        type: "p",
        text: "We protect your information with encryption in transit, encrypted storage of OAuth tokens, hashed passwords, short-lived access tokens and access controls on our systems. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    blocks: [
      {
        type: "p",
        text: "We use a single strictly necessary, secure session cookie to keep you signed in, and your browser's local storage to remember preferences such as your theme and sidebar state. We do not use advertising or cross-site tracking cookies.",
      },
    ],
  },
  {
    id: "children",
    title: "Children",
    blocks: [
      {
        type: "p",
        text: "The service is not directed to children under 16, and we do not knowingly collect personal information from them. If you believe a child has provided us with information, please contact us so we can delete it.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    blocks: [
      {
        type: "p",
        text: "Depending on where you live, you may have the right to access, correct, export or delete your personal information, and to object to or restrict certain processing. You can manage your connected accounts and files directly in the app, and you can contact us to exercise any other right.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy from time to time. When we make material changes we will update the date at the top of this page and, where appropriate, notify you in the app or by email.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      {
        type: "p",
        text: `Questions about this policy or your data? Email us at ${siteConfig.supportEmail}.`,
      },
    ],
  },
];
