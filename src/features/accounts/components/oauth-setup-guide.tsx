import type * as React from "react";
import { ExternalLink } from "lucide-react";

interface OAuthSetupGuideProps {
  redirectUrl: string | null;
}

const steps: { title: string; body: React.ReactNode }[] = [
  {
    title: "Create a new Google Cloud project",
    body: (
      <>
        Open{" "}
        <ConsoleLink href="https://console.cloud.google.com/projectcreate">
          Google Cloud Console
        </ConsoleLink>
        , click <b>New Project</b>, give it a name (for example “Reelcast”) and press <b>Create</b>.
        Make sure the new project is selected in the top bar.
      </>
    ),
  },
  {
    title: "Enable the YouTube Data API v3",
    body: (
      <>
        Go to <b>APIs &amp; Services → Library</b>, search for <b>YouTube Data API v3</b>, open it
        and click <b>Enable</b>. (
        <ConsoleLink href="https://console.cloud.google.com/apis/library/youtube.googleapis.com">
          direct link
        </ConsoleLink>
        )
      </>
    ),
  },
  {
    title: "Enable the YouTube Analytics API",
    body: (
      <>
        In <b>APIs &amp; Services → Library</b>, search for <b>YouTube Analytics API</b> and click{" "}
        <b>Enable</b>. (
        <ConsoleLink href="https://console.cloud.google.com/apis/library/youtubeanalytics.googleapis.com">
          direct link
        </ConsoleLink>
        )
      </>
    ),
  },
  {
    title: "Configure the OAuth consent screen",
    body: (
      <>
        Go to <b>APIs &amp; Services → OAuth consent screen</b> (Google Auth platform) and click{" "}
        <b>Get started</b>. Fill in the app name and your support email, choose <b>External</b> as
        the audience, add your contact email and finish. While the app is in <b>Testing</b>, add
        every Google account you want to connect under <b>Audience → Test users</b>.
      </>
    ),
  },
  {
    title: "Give the app YouTube permissions (Data access)",
    body: (
      <>
        Open <b>Data access → Add or remove scopes</b> and add these scopes:{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-[12px]">openid</code>,{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-[12px]">userinfo.email</code>,{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-[12px]">youtube.upload</code> and{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-[12px]">youtube.readonly</code>,{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-[12px]">youtube.force-ssl</code> and{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 text-[12px]">yt-analytics.readonly</code>.
        Channels connected earlier must be reconnected once to grant analytics access. Press{" "}
        <b>Update</b> and then <b>Save</b>.
      </>
    ),
  },
  {
    title: "Approve every permission",
    body: (
      <>
        On Google&apos;s permission screen, keep every checkbox ticked or choose <b>Select all</b>.
        Unticking a permission can stop the connection from working.
      </>
    ),
  },
  {
    title: "Create the OAuth client and add the redirect URL",
    body: (
      <>
        Go to <b>Clients → Create client</b>, choose <b>Web application</b>, and under{" "}
        <b>Authorized redirect URIs</b> paste the redirect URL shown in this window (use the Copy
        button). Press <b>Create</b>.
      </>
    ),
  },
  {
    title: "Copy the Client ID and Client Secret",
    body: (
      <>
        After creating the client Google shows the <b>Client ID</b> and <b>Client Secret</b>. Copy
        both, come back to this window, paste them into the form and press <b>Save</b>. If you close
        the Google popup early you can open the client again from <b>Clients</b> and copy the secret
        from there.
      </>
    ),
  },
];

function ConsoleLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground inline-flex items-center gap-1 font-medium underline underline-offset-4"
    >
      {children}
      <ExternalLink className="size-3" aria-hidden />
    </a>
  );
}

export function OAuthSetupGuide({ redirectUrl }: OAuthSetupGuideProps) {
  return (
    <div className="flex flex-col gap-5">
      <ol className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3.5">
            <span className="bg-foreground text-background mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-semibold">{step.title}</p>
              <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {redirectUrl ? (
        <div className="bg-muted rounded-2xl px-4 py-3">
          <p className="text-muted-foreground text-[12px]">Redirect URL for step 6</p>
          <p className="text-foreground mt-0.5 font-mono text-[12.5px] break-all">{redirectUrl}</p>
        </div>
      ) : null}
    </div>
  );
}
