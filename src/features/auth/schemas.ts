import { z } from "zod";
import { LIMITS } from "@/config/constants";

const email = z.email("Enter a valid email address.");

export const passwordRule = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use at most 128 characters.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100, "Use at most 100 characters."),
  email,
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\+?[0-9\s\-()]{7,20}$/.test(value),
      "Enter a valid phone number.",
    ),
  password: passwordRule,
  acceptTerms: z
    .boolean()
    .refine((value) => value, "Accept the terms and privacy policy to continue."),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    email,
    otp: z
      .string()
      .regex(new RegExp(`^\\d{${LIMITS.otpLength}}$`), `Enter the ${LIMITS.otpLength}-digit code.`),
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function passwordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) && /[A-Z]/.test(password)) score += 1;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] ?? "Strong" };
}
