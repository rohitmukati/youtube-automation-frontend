import type { Metadata } from "next";
import { DownloaderView } from "@/features/downloader/components/downloader-view";

export const metadata: Metadata = { title: "Video Downloader" };

export default function DownloaderPage() {
  return <DownloaderView />;
}