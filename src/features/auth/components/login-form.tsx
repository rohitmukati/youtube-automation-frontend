"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, PasswordInput } from "@/components/ui/input";
import { authApi } from "@/features/auth/api";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { applyServerErrors } from "@/lib/forms";
import { setSession } from "@/lib/auth/session";
import { isSafeRedirect } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const justReset = params.get("reset") === "1";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession(session);
      router.replace(isSafeRedirect(next) ? next : "/dashboard");
    },
    onError: (error) => {
      applyServerErrors(error, form.setError, { email: "email", password: "password" });
    },
  });

  const formError =
    mutation.error && !form.formState.errors.email && !form.formState.errors.password;

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      {justReset ? (
        <Alert tone="success">Your password was updated. Log in with your new password.</Alert>
      ) : null}
      {formError ? <Alert tone="danger">{mutation.error?.message}</Alert> : null}

      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          {...form.register("email")}
        />
      </Field>

      <Field
        label="Password"
        error={form.formState.errors.password?.message}
        action={
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground text-[13px]"
          >
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          autoComplete="current-password"
          placeholder="Enter your password"
          {...form.register("password")}
        />
      </Field>

      <Button type="submit" size="lg" loading={mutation.isPending} className="mt-1 w-full">
        Log in
      </Button>
    </form>
  );
}
