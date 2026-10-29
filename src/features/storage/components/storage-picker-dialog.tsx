"use client";

import * as React from "react";
import { FileUp, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { FilePreview } from "@/features/storage/components/file-card";
import { UploadDialog } from "@/features/storage/components/upload-dialog";
import { useStorageFiles } from "@/features/storage/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api/errors";
import { formatBytes } from "@/lib/utils";
import type { StorageFile } from "@/types/api";

interface StoragePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Only images with one of these content types can be picked (for example JPG and PNG). */
  contentTypes?: readonly string[];
  /** Text shown under the title. */
  description?: string;
  onSelect: (file: StorageFile) => void;
}

const PAGE_SIZE = 12;

export function StoragePickerDialog({
  open,
  onOpenChange,
  title,
  contentTypes,
  description = "Pick an image from your library.",
  onSelect,
}: StoragePickerDialogProps) {
  const [search, setSearch] = React.useState("");
  const [offset, setOffset] = React.useState(0);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const debounced = useDebouncedValue(search.trim());

  const { data, isLoading, isFetching, isError, error, refetch } = useStorageFiles(
    { search: debounced || undefined, limit: PAGE_SIZE, offset },
    open,
  );
  const allFiles = data?.files ?? [];
  const files = contentTypes
    ? allFiles.filter((file) => contentTypes.includes(file.content_type))
    : allFiles;
  const hiddenCount = allFiles.length - files.length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="xl">
          <DialogHeader title={title} description={description} />
          <DialogBody className="flex flex-col gap-5">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setOffset(0);
                  }}
                  placeholder="Search by name or tag"
                  aria-label="Search files"
                  className="h-10 pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setUploadOpen(true)}
                className="w-full sm:w-auto"
              >
                <FileUp /> Upload new
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-video" />
                ))}
              </div>
            ) : null}

            {isError ? (
              <Alert
                tone="danger"
                title="Images could not be loaded"
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    loading={isFetching}
                    onClick={() => void refetch()}
                  >
                    Try again
                  </Button>
                }
              >
                {getErrorMessage(error)}
              </Alert>
            ) : null}

            {!isLoading && !isError && files.length === 0 ? (
              <p className="bg-muted text-muted-foreground rounded-2xl px-4 py-10 text-center text-sm">
                {hiddenCount > 0
                  ? "No suitable images on this page. YouTube accepts JPG and PNG thumbnails only."
                  : "No images found. Upload one to continue."}
              </p>
            ) : null}

            {files.length > 0 ? (
              <ul
                className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${isFetching ? "opacity-70" : ""}`}
              >
                {files.map((file) => (
                  <li key={file.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(file);
                        onOpenChange(false);
                      }}
                      className="group border-border hover:border-foreground w-full overflow-hidden rounded-2xl border text-left transition-colors"
                    >
                      <FilePreview file={file} className="aspect-video w-full" />
                      <span className="block px-3 py-2.5">
                        <span className="text-foreground block truncate text-[13px] font-medium">
                          {file.original_name}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          {formatBytes(file.size_bytes)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {hiddenCount > 0 && files.length > 0 ? (
              <p className="text-muted-foreground text-[13px]">
                {hiddenCount} {hiddenCount === 1 ? "image is" : "images are"} hidden because YouTube
                accepts JPG and PNG thumbnails only.
              </p>
            ) : null}

            <Pagination
              total={data?.total ?? 0}
              limit={PAGE_SIZE}
              offset={offset}
              onChange={setOffset}
              loading={isFetching}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
