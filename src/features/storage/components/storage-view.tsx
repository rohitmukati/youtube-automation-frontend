"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileUp, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { LIMITS } from "@/config/constants";
import { EditTagsDialog } from "@/features/storage/components/edit-tags-dialog";
import { FileCard } from "@/features/storage/components/file-card";
import { PreviewDialog } from "@/features/storage/components/preview-dialog";
import { UploadDialog } from "@/features/storage/components/upload-dialog";
import { useDeleteFile, useStorageFiles } from "@/features/storage/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api/errors";
import type { StorageFile, StorageFileType } from "@/types/api";

type TypeFilter = "all" | StorageFileType;

export function StorageView() {
  const router = useRouter();
  const params = useSearchParams();

  const [type, setTypeState] = React.useState<TypeFilter>("all");
  const [search, setSearch] = React.useState(params.get("search") ?? "");
  const [offset, setOffset] = React.useState(0);
  const [uploadManual, setUploadManual] = React.useState(false);
  const uploadOpen = uploadManual || params.get("upload") === "1";
  const [preview, setPreview] = React.useState<StorageFile | null>(null);
  const [tagTarget, setTagTarget] = React.useState<StorageFile | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<StorageFile | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());
  const remove = useDeleteFile();

  function setUploadOpen(open: boolean) {
    setUploadManual(open);
    if (!open && params.get("upload") === "1") router.replace("/storage", { scroll: false });
  }

  function setType(next: TypeFilter) {
    setTypeState(next);
    setOffset(0);
  }

  const { data, isLoading, isFetching, isError, error, refetch } = useStorageFiles({
    type: type === "all" ? undefined : type,
    search: debouncedSearch || undefined,
    limit: LIMITS.storagePageSize,
    offset,
  });

  const files = data?.files ?? [];
  const filtering = type !== "all" || debouncedSearch !== "";

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Storage"
        description="Your private library of videos and images. Publish any video to your channels in a few clicks."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <FileUp /> Upload files
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl<TypeFilter>
          label="Filter by type"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "All" },
            { value: "video", label: "Videos" },
            { value: "image", label: "Images" },
          ]}
        />
        <div className="relative w-full sm:w-72">
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
      </div>

      {isError ? (
        <Alert
          tone="danger"
          title="Files could not be loaded"
          action={
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/3] rounded-3xl" />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && files.length === 0 ? (
        filtering ? (
          <EmptyState
            variant="bloom"
            title="No files match"
            description="Try a different name or tag, or clear the filters."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setType("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            variant="meadow"
            title="Your library is empty"
            description="Upload a video to get started. Add images to use as custom thumbnails."
            action={
              <Button onClick={() => setUploadOpen(true)}>
                <FileUp /> Upload files
              </Button>
            }
          />
        )
      ) : null}

      {files.length > 0 ? (
        <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onPreview={setPreview}
                onEditTags={setTagTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          <div className="mt-6">
            <Pagination
              total={data?.total ?? 0}
              limit={LIMITS.storagePageSize}
              offset={offset}
              onChange={setOffset}
              loading={isFetching}
            />
          </div>
        </div>
      ) : null}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <PreviewDialog file={preview} onOpenChange={(open) => !open && setPreview(null)} />
      <EditTagsDialog file={tagTarget} onOpenChange={(open) => !open && setTagTarget(null)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this file?"
        description={`${deleteTarget?.original_name ?? "This file"} will be removed from Storage permanently. Past uploads are not affected.`}
        confirmLabel="Delete file"
        onConfirm={async () => {
          if (deleteTarget) await remove.mutateAsync(deleteTarget.id);
        }}
      />
    </div>
  );
}
