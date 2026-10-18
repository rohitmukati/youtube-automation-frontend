import { describe, expect, it } from "vitest";
import { credentialsSchema, toCredentialsStatus } from "@/features/accounts/credentials";

describe("credentialsSchema", () => {
  const valid = {
    clientId: "1234567890-abc.apps.googleusercontent.com",
    clientSecret: "GOCSPX-abcdefghijkl",
  };

  it("accepts a valid Google client id and secret", () => {
    expect(credentialsSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a client id without the Google suffix", () => {
    expect(credentialsSchema.safeParse({ ...valid, clientId: "abc" }).success).toBe(false);
  });

  it("rejects empty, short or spaced secrets", () => {
    expect(credentialsSchema.safeParse({ ...valid, clientSecret: "" }).success).toBe(false);
    expect(credentialsSchema.safeParse({ ...valid, clientSecret: "short" }).success).toBe(false);
    expect(credentialsSchema.safeParse({ ...valid, clientSecret: "GOCSPX abc def ghi" }).success).toBe(
      false,
    );
  });
});

describe("toCredentialsStatus", () => {
  it("maps a saved response", () => {
    expect(
      toCredentialsStatus({
        configured: true,
        client_id: "x.apps.googleusercontent.com",
        client_secret_saved: true,
        redirect_uri: "http://localhost:8000/api/v1/youtube/callback",
        updated_at: "2026-10-18T10:00:00Z",
      }),
    ).toEqual({
      configured: true,
      clientId: "x.apps.googleusercontent.com",
      redirectUrl: "http://localhost:8000/api/v1/youtube/callback",
      updatedAt: "2026-10-18T10:00:00Z",
    });
  });

  it("maps an unconfigured response", () => {
    expect(
      toCredentialsStatus({
        configured: false,
        client_id: null,
        client_secret_saved: false,
        redirect_uri: "http://localhost:8000/api/v1/youtube/callback",
        updated_at: null,
      }),
    ).toEqual({
      configured: false,
      clientId: null,
      redirectUrl: "http://localhost:8000/api/v1/youtube/callback",
      updatedAt: null,
    });
  });
});