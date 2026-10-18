"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Checkbox, Input, PasswordInput } from "@/components/ui/input";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import { authApi } from "@/features/auth/api";
import { signupSchema, type SignupValues } from "@/features/auth/schemas";
import { setSession } from "@/lib/auth/session";
import { applyServerErrors } from "@/lib/forms";

export function SignupForm() {
  const router = useRouter();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", acceptTerms: false },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (session) => {
      setSession(session);
      router.replace("/dashboard");
    },
    onError: (error) => {
      applyServerErrors(error, form.setError, {
        name: "name",
        email: "email",
        phone: "phone",
        password: "password",
      });
    },
  });

  const hasFieldError = Boolean(errors.name || errors.email || errors.phone || errors.password);
  const password = useWatch({ control: form.control, name: "password" });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      {mutation.error && !hasFieldError ? (
        <Alert tone="danger">{mutation.error.message}</Alert>
      ) : null}

      <Field label="Full name" error={errors.name?.message}>
        <Input autoComplete="name" placeholder="Your name" {...form.register("name")} />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          {...form.register("email")}
        />
      </Field>

      <Field label="Phone" optional error={errors.phone?.message}>
        <Input
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          {...form.register("phone")}
        />
      </Field>

      <Field
        label="Password"
        error={errors.password?.message}
        hint="At least 8 characters, with a letter and a number."
      >
        <PasswordInput
          autoComplete="new-password"
          placeholder="Create a password"
          {...form.register("password")}
        />
      </Field>
      <PasswordStrength password={password} />

      <Controller
        control={form.control}
        name="acceptTerms"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <label className="text-body flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-foreground font-medium underline underline-offset-4"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-foreground font-medium underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.acceptTerms ? (
              <p role="alert" className="text-danger text-[13px]">
                {errors.acceptTerms.message}
              </p>
            ) : null}
          </div>
        )}
      />

      <Button type="submit" size="lg" loading={mutation.isPending} className="w-full">
        Create account
      </Button>
    </form>
  );
}
