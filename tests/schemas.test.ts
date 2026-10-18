import { describe, expect, it } from "vitest";
import { resetPasswordSchema, signupSchema } from "@/features/auth/schemas";
import { publishSchema } from "@/features/uploads/schemas";

const validSignup = {
  name: "Asha Verma",
  email: "asha@example.com",
  phone: "",
  password: "strong123",
  acceptTerms: true,
};

describe("signupSchema", () => {
  it("accepts valid input", () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it("requires a letter and a number in the password", () => {
    expect(signupSchema.safeParse({ ...validSignup, password: "abcdefgh" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...validSignup, password: "12345678" }).success).toBe(false);
  });

  it("requires accepting the terms", () => {
    expect(signupSchema.safeParse({ ...validSignup, acceptTerms: false }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const base = {
    email: "asha@example.com",
    otp: "123456",
    newPassword: "strong123",
    confirmPassword: "strong123",
  };

  it("accepts matching passwords and a 6 digit code", () => {
    expect(resetPasswordSchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched passwords and malformed codes", () => {
    expect(resetPasswordSchema.safeParse({ ...base, confirmPassword: "other123" }).success).toBe(
      false,
    );
    expect(resetPasswordSchema.safeParse({ ...base, otp: "12ab56" }).success).toBe(false);
  });
});

describe("publishSchema", () => {
  const base = {
    storageFileId: "file-1",
    thumbnailFileId: null,
    title: "Episode 1",
    description: "",
    tags: ["news"],
    categoryId: "22",
    privacy: "public" as const,
    schedule: false,
    publishAt: "",
    madeForKids: false,
    notifySubscribers: true,
    language: "",
    accountIds: ["a1"],
  };

  it("accepts a valid immediate publish", () => {
    expect(publishSchema.safeParse(base).success).toBe(true);
  });

  it("requires at least one channel and a title without angle brackets", () => {
    expect(publishSchema.safeParse({ ...base, accountIds: [] }).success).toBe(false);
    expect(publishSchema.safeParse({ ...base, title: "<b>Hi</b>" }).success).toBe(false);
  });

  it("requires a future time when scheduling", () => {
    const past = new Date(Date.now() - 3_600_000).toISOString();
    const future = new Date(Date.now() + 3_600_000).toISOString();
    expect(publishSchema.safeParse({ ...base, schedule: true, publishAt: past }).success).toBe(
      false,
    );
    expect(publishSchema.safeParse({ ...base, schedule: true, publishAt: future }).success).toBe(
      true,
    );
  });
});
