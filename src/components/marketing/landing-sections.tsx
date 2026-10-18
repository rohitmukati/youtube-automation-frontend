import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FolderOpen,
  Gauge,
  KeyRound,
  Layers,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Unplug,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { Button } from "@/components/ui/button";
import { Orb } from "@/components/ui/orb";
import { LIMITS } from "@/config/constants";
import { formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24 lg:pb-28">
        <div>
          <h1 className="animate-rise text-foreground text-[44px] leading-[1.04] font-medium tracking-tight sm:text-[60px]">
            Publish one video to every channel you run.
          </h1>
          <p
            className="animate-rise text-body mt-6 max-w-xl text-lg"
            style={{ animationDelay: "120ms" }}
          >
            Connect your YouTube accounts, keep your media in one private library, and send a video
            to up to {LIMITS.maxChannelsPerUpload} channels at once. Follow each upload live and
            retry only what failed.
          </p>
          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "220ms" }}
          >
            <Button asChild size="lg">
              <Link href="/signup">
                Create your account <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
        <div
          className="animate-rise flex justify-center lg:justify-end"
          style={{ animationDelay: "320ms" }}
        >
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  wide?: boolean;
}

const features: Feature[] = [
  {
    icon: Layers,
    title: "Many channels, one upload",
    body: `Choose a video, write its details once, and publish to up to ${LIMITS.maxChannelsPerUpload} connected channels in a single step. Each channel uploads independently, so one problem never blocks the rest.`,
    wide: true,
  },
  {
    icon: FolderOpen,
    title: "A private media library",
    body: "Keep videos and thumbnails in Storage. Tag them, search them, preview them, and reuse them whenever you publish.",
  },
  {
    icon: Activity,
    title: "Live progress per channel",
    body: "See which channels are uploading, waiting, retrying or done, with a direct link to the video once it is live.",
  },
  {
    icon: RotateCcw,
    title: "Retries that make sense",
    body: "Temporary failures are retried automatically, up to three attempts per channel. When something still fails, retry just those channels with one click.",
    wide: true,
  },
  {
    icon: CalendarClock,
    title: "Schedule and fine-tune",
    body: "Set title, description, tags, category, language, visibility, a custom thumbnail, or a publish time in your own time zone.",
  },
  {
    icon: Gauge,
    title: "No surprises at the limit",
    body: "Your remaining uploads for the day are always visible, and the form warns you before you select more channels than you can publish to.",
    wide: true,
  },
];

export function Features() {
  return (
    <section id="features" className="border-border bg-surface scroll-mt-24 border-t">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <h2 className="text-foreground text-[34px] leading-tight font-medium tracking-tight sm:text-[42px]">
            Everything a multi-channel publisher needs, and nothing else.
          </h2>
          <p className="text-body mt-4 text-lg">
            Built around the three things you do every day: manage accounts, organise media, and
            publish.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className={cn(
                  "reveal border-border bg-card rounded-3xl border p-7",
                  feature.wide && "lg:col-span-2",
                )}
              >
                <span className="bg-muted text-foreground grid size-11 place-items-center rounded-2xl">
                  <Icon className="size-5" strokeWidth={1.6} aria-hidden />
                </span>
                <h3 className="text-foreground mt-6 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-body mt-2 max-w-xl text-[15px] leading-relaxed">
                  {feature.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Connect your accounts",
    body: "Sign in with Google for each YouTube channel you publish to. Give every account a name you will recognise.",
  },
  {
    title: "Add your video",
    body: "Upload a video to Storage, or pick one you already have. Add a thumbnail if you like.",
  },
  {
    title: "Choose channels and details",
    body: "Write the title, description and tags once, then select the channels and when to publish.",
  },
  {
    title: "Publish and follow along",
    body: "Watch every channel upload in real time and open each video when it is live.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-border scroll-mt-24 border-t">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <h2 className="text-foreground max-w-2xl text-[34px] leading-tight font-medium tracking-tight sm:text-[42px]">
          From a single file to every channel in four steps.
        </h2>
        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-full text-sm font-medium">
                {index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="bg-border absolute top-5 left-14 hidden h-px w-[calc(100%-3.5rem)] lg:block"
                />
              ) : null}
              <h3 className="text-foreground mt-5 text-base font-semibold">{step.title}</h3>
              <p className="text-body mt-2 text-[15px] leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const assurances: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: LockKeyhole,
    title: "Encrypted connections to YouTube",
    body: "Access tokens for your channels are stored encrypted. Passwords are never stored in plain text.",
  },
  {
    icon: KeyRound,
    title: "Only the access it needs",
    body: "Permission to upload videos and read basic channel details. Nothing is published unless you start an upload.",
  },
  {
    icon: Unplug,
    title: "Disconnect whenever you want",
    body: "Remove any account in one click. You can also revoke access from your Google account at any time.",
  },
];

export function Trust() {
  return (
    <section className="border-border bg-surface border-t">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="border-border bg-card relative overflow-hidden rounded-[32px] border p-8 sm:p-12">
          <Orb
            size="22rem"
            variant="lagoon"
            blur
            className="absolute -top-24 -right-20 opacity-30"
          />
          <div className="relative max-w-xl">
            <span className="bg-muted text-foreground grid size-11 place-items-center rounded-2xl">
              <ShieldCheck className="size-5" strokeWidth={1.6} aria-hidden />
            </span>
            <h2 className="text-foreground mt-6 text-[30px] leading-tight font-medium tracking-tight sm:text-[36px]">
              Your channels stay in your control.
            </h2>
          </div>
          <ul className="relative mt-10 grid gap-8 md:grid-cols-3">
            {assurances.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title}>
                  <Icon className="text-foreground size-5" strokeWidth={1.6} aria-hidden />
                  <h3 className="text-foreground mt-4 text-base font-semibold">{item.title}</h3>
                  <p className="text-body mt-2 text-[15px] leading-relaxed">{item.body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "What do I need to get started?",
    a: "An account here and at least one Google account that owns a YouTube channel. You connect each channel once through Google, then it is available for every upload.",
  },
  {
    q: "Which files can I upload?",
    a: `Videos in MP4, MOV, AVI, MKV, WEBM or MPEG format up to ${formatBytes(LIMITS.videoBytes)}, and JPG, PNG, WEBP or GIF images up to ${formatBytes(LIMITS.imageBytes)} for thumbnails.`,
  },
  {
    q: "Is there a daily upload limit?",
    a: "Yes. A daily limit applies across all of your channels, and it is always shown in the app along with when it resets. YouTube also applies its own limits to each channel.",
  },
  {
    q: "What happens if an upload fails on one channel?",
    a: "The other channels carry on. Temporary problems are retried automatically, and anything that still fails shows a clear reason and can be retried on its own.",
  },
  {
    q: "Can I schedule a video?",
    a: "Yes. Choose a date and time and the video is uploaded as private, then goes live at the time you picked.",
  },
  {
    q: "Is this affiliated with YouTube?",
    a: "No. This is an independent service that uses the official YouTube API with your permission. You can revoke that permission at any time from your Google account.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-border scroll-mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-28">
        <h2 className="text-foreground text-[34px] leading-tight font-medium tracking-tight sm:text-[42px]">
          Questions, answered.
        </h2>
        <div className="divide-border border-border divide-y border-y">
          {faqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-6 text-base font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="bg-muted text-foreground grid size-7 shrink-0 place-items-center rounded-full transition-transform group-open:rotate-45"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </span>
              </summary>
              <p className="text-body mt-3 max-w-xl text-[15px] leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="border-border border-t">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="bg-foreground text-background relative overflow-hidden rounded-[32px] px-8 py-16 text-center sm:px-16">
          <Orb
            size="20rem"
            variant="sunset"
            blur
            className="animate-orb absolute -bottom-24 -left-16 opacity-70"
          />
          <Orb
            size="18rem"
            variant="lagoon"
            blur
            className="animate-orb-slow absolute -top-24 -right-12 opacity-60"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-[34px] leading-tight font-medium tracking-tight sm:text-[44px]">
              Ready to publish everywhere at once?
            </h2>
            <p className="mt-4 text-lg opacity-80">
              Create your account, connect a channel, and send your first multi-channel upload.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
              >
                <Link href="/signup">Create your account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-background hover:bg-background/15 hover:text-background"
              >
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
