import { api } from "@/lib/api/client";
import type {
  CreateUploadRequest,
  CreateUploadResponse,
  MediaState,
  UploadJobDetail,
  UploadJobListResponse,
  UploadJobStatus,
  UploadQuota,
} from "@/types/api";

export interface UploadListParams {
  status?: UploadJobStatus;
  account_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  limit: number;
  offset: number;
}

/** Joining a large file on the server can take a while, so `complete` gets a longer timeout. */
const COMPLETE_TIMEOUT_MS = 5 * 60_000;

export const uploadsApi = {
  async create(payload: CreateUploadRequest, signal?: AbortSignal): Promise<CreateUploadResponse> {
    const { data } = await api.post<CreateUploadResponse>("/yt-channels/uploads", payload, {
      signal,
    });
    return data;
  },

  async list(params: UploadListParams): Promise<UploadJobListResponse> {
    const { data } = await api.get<UploadJobListResponse>("/yt-channels/uploads", {
      params: {
        status: params.status,
        account_id: params.account_id,
        search: params.search || undefined,
        date_from: params.date_from,
        date_to: params.date_to,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return data;
  },

  async get(id: string): Promise<UploadJobDetail> {
    const { data } = await api.get<UploadJobDetail>(`/yt-channels/uploads/${id}`);
    return data;
  },

  async quota(): Promise<UploadQuota> {
    const { data } = await api.get<UploadQuota>("/yt-channels/uploads/quota");
    return data;
  },

  async mediaState(id: string, signal?: AbortSignal): Promise<MediaState> {
    const { data } = await api.get<MediaState>(`/yt-channels/uploads/${id}/media`, { signal });
    return data;
  },

  async completeMedia(id: string, signal?: AbortSignal): Promise<UploadJobDetail> {
    const { data } = await api.post<UploadJobDetail>(
      `/yt-channels/uploads/${id}/media/complete`,
      undefined,
      { timeout: COMPLETE_TIMEOUT_MS, signal },
    );
    return data;
  },

  async retry(id: string): Promise<UploadJobDetail> {
    const { data } = await api.post<UploadJobDetail>(`/yt-channels/uploads/${id}/retry`);
    return data;
  },

  async cancel(id: string): Promise<UploadJobDetail> {
    const { data } = await api.post<UploadJobDetail>(`/yt-channels/uploads/${id}/cancel`);
    return data;
  },
};
