import type { Metadata } from "next";
import { Suspense } from "react";
import { UploadsView } from "@/features/uploads/components/uploads-view";

export const metadata: Metadata = { title: "Upload History" };

export default function UploadsPage() {
  return (
    <Suspense>
      <UploadsView />
    </Suspense>
  );
}
