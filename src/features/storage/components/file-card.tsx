"use client";

import { Ellipsis, Eye, Film, ImageIcon, Send, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBytes } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { StorageFile } from "@/types/api";

export function isVideoFile(file: StorageFile): boolean {
  return file.file_type === "video" || file.content_type.startsWith("video/");
}

export function FilePreview({ file, className }: { file: StorageFile; className?: string }) {
  if (!file.signed_url) {
    return (
      <div className={`bg-muted text-muted-foreground grid place-items-center ${className ?? ""}`}>
        {isVideoFile(file) ? <Film className="size-8" /> : <ImageIcon className="size-8" />}
      </div>
    );
  }
  if (isVideoFile(file)) {
    return (
      <video
        src={`${file.signed_url}#t=0.5`}
        preload="metadata"
        muted
        playsInline
        className={`bg-muted object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <img
      src={file.signed_url}
      alt={file.original_name}
      loading="lazy"
      className={`bg-muted object-cover ${className ?? ""}`}
    />
  );
}

interface FileCardProps {
  file: StorageFile;
  onPreview: (file: StorageFile) => void;
  onEditTags: (file: StorageFile) => void;
  onDelete: (file: StorageFile) => void;
}

export function FileCard({ file, onPreview, onEditTags, onDelete }: FileCardProps) {
  const video = isVideoFile(file);

  return (
    <article className="group border-border bg-card flex flex-col overflow-hidden rounded-3xl border">
      <button
        type="button"
        onClick={() => onPreview(file)}
        className="relative block aspect-video w-full overflow-hidden"
        aria-label={`Preview ${file.original_name}`}
      >
        <FilePreview
          file={file}
          className="size-full transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute top-3 left-3">
          <Badge tone="outline" className="bg-background/90 backdrop-blur">
            {video ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
            {video ? "Video" : "Image"}
          </Badge>
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground truncate text-sm font-medium" title={file.original_name}>
              {file.original_name}
            </h3>
            <p className="text-muted-foreground mt-0.5 text-[13px]">
              {formatBytes(file.size_bytes)} · {formatDate(file.created_at)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                shape="rounded"
                aria-label={`Actions for ${file.original_name}`}
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => onPreview(file)}>
                <Eye /> Preview
              </DropdownMenuItem>
              {video ? (
                <DropdownMenuItem asChild>
                  <Link href={`/uploads/new?file=${file.id}`}>
                    <Send /> Publish to channels
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={() => onEditTags(file)}>
                <Tag /> Edit tags
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => onDelete(file)}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {file.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {file.tags.slice(0, 4).map((tag) => (
              <li key={tag} className="bg-muted text-body rounded-full px-2.5 py-0.5 text-xs">
                {tag}
              </li>
            ))}
            {file.tags.length > 4 ? (
              <li className="text-muted-foreground rounded-full px-1.5 py-0.5 text-xs">
                +{file.tags.length - 4}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
