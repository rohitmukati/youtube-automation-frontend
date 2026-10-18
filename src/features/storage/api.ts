import { api } from "@/lib/api/client";
import type {
  MessageResponse,
  StorageFile,
  StorageFileListResponse,
  StorageFileType,
} from "@/types/api";

export interface StorageListParams {
  type?: StorageFileType;
  tags?: string[];
  search?: string;
  limit: number;
  offset: number;
}

export const storageApi = {
  async list(params: StorageListParams): Promise<StorageFileListResponse> {
    const { data } = await api.get<StorageFileListResponse>("/storage/files", {
      params: {
        type: params.type,
        tags: params.tags && params.tags.length > 0 ? params.tags.join(",") : undefined,
        search: params.search || undefined,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return data;
  },

  async upload(
    file: File,
    tags: string[],
    onProgress?: (percent: number) => void,
    signal?: AbortSignal,
  ): Promise<StorageFile> {
    const form = new FormData();
    form.append("file", file);
    if (tags.length > 0) form.append("tags", tags.join(","));
    const { data } = await api.post<StorageFile>("/storage/files", form, {
      timeout: 0,
      signal,
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return data;
  },

  async updateTags(id: string, tags: string[]): Promise<StorageFile> {
    const { data } = await api.patch<StorageFile>(`/storage/files/${id}`, { tags });
    return data;
  },

  async remove(id: string): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`/storage/files/${id}`);
    return data;
  },
};
