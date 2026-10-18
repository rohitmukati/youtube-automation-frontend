import { z } from "zod";

const flag = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const schema = z.object({
  appName: z.string().min(1),
  appUrl: z.url().transform((value) => value.replace(/\/+$/, "")),
  apiUrl: z.url().transform((value) => value.replace(/\/+$/, "")),
  skipNgrokWarning: flag,
  supportEmail: z.email(),
  maxVideoMb: z.coerce.number().positive(),
  maxImageMb: z.coerce.number().positive(),
});

const parsed = schema.safeParse({
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Reelcast",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  skipNgrokWarning: process.env.NEXT_PUBLIC_API_SKIP_NGROK_WARNING,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
  maxVideoMb: process.env.NEXT_PUBLIC_MAX_VIDEO_MB ?? "50",
  maxImageMb: process.env.NEXT_PUBLIC_MAX_IMAGE_MB ?? "10",
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment configuration. ${issues.join("; ")}`);
}

export const env = parsed.data;
