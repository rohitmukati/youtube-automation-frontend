import { z } from "zod";
import type { YouTubeCredentialsResponse, YouTubeCredentialsStatus } from "@/types/api";

// Mirrors the backend validation (google_client_id_pattern and the client secret length limits).
const CLIENT_ID_PATTERN = /^[A-Za-z0-9._-]{8,200}\.apps\.googleusercontent\.com$/;

export const credentialsSchema = z.object({
  clientId: z
    .string()
    .trim()
    .min(1, "Enter your Google Client ID.")
    .max(255, "That Client ID is too long.")
    .refine((value) => value === "" || CLIENT_ID_PATTERN.test(value), {
      message: "Client ID looks like 1234567890-abc123.apps.googleusercontent.com",
    }),
  clientSecret: z
    .string()
    .trim()
    .min(1, "Enter your Google Client Secret.")
    .min(8, "That Client Secret looks too short.")
    .max(256, "That Client Secret is too long.")
    .refine((value) => !/\s/.test(value), { message: "Client Secret cannot contain spaces." }),
});

export type CredentialsValues = z.infer<typeof credentialsSchema>;

export function toCredentialsStatus(response: YouTubeCredentialsResponse): YouTubeCredentialsStatus {
  return {
    configured: response.configured,
    clientId: response.client_id ?? null,
    redirectUrl: response.redirect_uri || null,
    updatedAt: response.updated_at ?? null,
  };
}