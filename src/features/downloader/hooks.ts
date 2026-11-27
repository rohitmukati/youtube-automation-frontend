"use client";

import { useMutation } from "@tanstack/react-query";
import { downloaderApi } from "@/features/downloader/api";

export function useVideoInfo() {
  return useMutation({
    mutationFn: (url: string) => downloaderApi.info(url),
  });
}

export function usePrepareDownload() {
  return useMutation({
    mutationFn: ({ url, optionId }: { url: string; optionId: string }) =>
      downloaderApi.prepare(url, optionId),
  });
}