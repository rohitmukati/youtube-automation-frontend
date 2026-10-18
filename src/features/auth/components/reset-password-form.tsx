"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, PasswordInput } from "@/components/ui/input";
import { LIMITS } from "@/config/constants";
import { authApi } from "@/features/auth/api";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";
import { getErrorMessage } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params.get("email") ?? "";
  const [cooldown, setCooldown] = React.useState(
    params.get("sent") === "1" ? LIMITS.resendCooldownSeconds : 0,
  );

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: initialEmail, otp: "", newPassword: "", confirmPassword: "" },
  });
  const { errors } = form.formState;

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const reset = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      authApi.resetPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password updated.");
      router.replace("/login?reset=1");
    },
    onError: (error) => {
      applyServerErrors(error, form.setError, {
        email: "email",
        otp: "otp",
        new_password: "newPassword",
      });
    },
  });

  const resend = useMutation({
    mutationFn: async () => {
      const valid = await form.trigger("email");
      if (!valid) throw new Error("Enter a valid email address first.");
      return authApi.forgotPassword(form.getValues("email"));
    },
    onSuccess: () => {
      setCooldown(LIMITS.resendCooldownSeconds);
      toast.success("If an account exists for that email, a new code is on its way.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const hasFieldError = Boolean(errors.email || errors.otp || errors.newPassword);
  const newPassword = useWatch({ control: form.control, name: "newPassword" });

  return (
    <form
      onSubmit={form.handleSubmit((values) => reset.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      {reset.error && !hasFieldError ? <Alert tone="danger">{reset.error.message}</Alert> : null}

      <Field label="Email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          {...form.register("email")}
        />
      </Field>

      <Field
        label="Verification code"
        error={errors.otp?.message}
        action={
          <button
            type="button"
            disabled={cooldown > 0 || resend.isPending}
            onClick={() => resend.mutate()}
            className="text-muted-foreground hover:text-foreground text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        }
      >
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={LIMITS.otpLength}
          placeholder="123456"
          className="tracking-[0.35em]"
          {...form.register("otp", {
            onChange: (event) => {
              event.target.value = event.target.value.replace(/\D/g, "").slice(0, LIMITS.otpLength);
            },
          })}
        />
      </Field>

      <Field
        label="New password"
        error={errors.newPassword?.message}
        hint="At least 8 characters, with a letter and a number."
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder="Create a new password"
          {...form.register("newPassword")}
        />
      </Field>
      <PasswordStrength password={newPassword} />

      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        <PasswordInput
          autoComplete="new-password"
          placeholder="Repeat your new password"
          {...form.register("confirmPassword")}
        />
      </Field>

      <Button type="submit" size="lg" loading={reset.isPending} className="w-full">
        Update password
      </Button>
    </form>
  );
}
