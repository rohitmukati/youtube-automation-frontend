import type { Metadata } from "next";
import { Suspense } from "react";
import { PublishForm } from "@/features/uploads/components/publish-form";

export const metadata: Metadata = { title: "Publish" };

export default function PublishPage() {
  return (
    <Suspense>
      <PublishForm />
    </Suspense>
  );
}
