"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authApi } from "@/features/auth/api";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";

export function ForgotPasswordForm() {
  const router = useRouter();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordValues) => authApi.forgotPassword(values.email),
    onSuccess: (_data, values) => {
      toast.success("If an account exists for that email, a code is on its way.");
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}&sent=1`);
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
      className="flex flex-col gap-5"
    >
      {mutation.error ? <Alert tone="danger">{mutation.error.message}</Alert> : null}
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          {...form.register("email")}
        />
      </Field>
      <Button type="submit" size="lg" loading={mutation.isPending} className="w-full">
        Send reset code
      </Button>
    </form>
  );
}
