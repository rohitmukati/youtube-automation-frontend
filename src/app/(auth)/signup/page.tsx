import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start publishing to all of your YouTube channels from one place."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-medium underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
