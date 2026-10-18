import type { Metadata } from "next";
import { Suspense } from "react";
import { StorageView } from "@/features/storage/components/storage-view";

export const metadata: Metadata = { title: "Storage" };

export default function StoragePage() {
  return (
    <Suspense>
      <StorageView />
    </Suspense>
  );
}
