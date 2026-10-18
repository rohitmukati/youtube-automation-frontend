import type { Metadata } from "next";
import { UploadDetailView } from "@/features/uploads/components/upload-detail-view";

export const metadata: Metadata = { title: "Upload details" };

export default async function UploadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UploadDetailView id={id} />;
}
