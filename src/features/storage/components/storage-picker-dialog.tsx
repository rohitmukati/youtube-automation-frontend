"use client";

import * as React from "react";
import { FileUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { FilePreview } from "@/features/storage/components/file-card";
import { UploadDialog } from "@/features/storage/components/upload-dialog";
import { useStorageFiles } from "@/features/storage/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatBytes } from "@/lib/utils";
import type { StorageFile, StorageFileType } from "@/types/api";

interface StoragePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: StorageFileType;
  title: string;
  onSelect: (file: StorageFile) => void;
}

const PAGE_SIZE = 12;

export function StoragePickerDialog({
  open,
  onOpenChange,
  type,
  title,
  onSelect,
}: StoragePickerDialogProps) {
  const [search, setSearch] = React.useState("");
  const [offset, setOffset] = React.useState(0);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const debounced = useDebouncedValue(search.trim());

  const { data, isLoading, isFetching } = useStorageFiles(
    { type, search: debounced || undefined, limit: PAGE_SIZE, offset },
    open,
  );
  const files = data?.files ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="xl">
          <DialogHeader title={title} description={`Pick a ${type} from your Storage library.`} />
          <DialogBody className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-56 flex-1">
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
              <Button variant="outline" onClick={() => setUploadOpen(true)}>
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

            {!isLoading && files.length === 0 ? (
              <p className="bg-muted text-muted-foreground rounded-2xl px-4 py-10 text-center text-sm">
                No {type}s found. Upload one to continue.
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
