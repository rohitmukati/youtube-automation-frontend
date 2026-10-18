import { api } from "@/lib/api/client";
import type {
  CreateUploadRequest,
  MessageResponse,
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

export const uploadsApi = {
  async create(payload: CreateUploadRequest): Promise<UploadJobDetail> {
    const { data } = await api.post<UploadJobDetail>("/yt-channels/uploads", payload);
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

  async retry(id: string): Promise<UploadJobDetail | MessageResponse> {
    const { data } = await api.post<UploadJobDetail | MessageResponse>(
      `/yt-channels/uploads/${id}/retry`,
    );
    return data;
  },

  async cancel(id: string): Promise<UploadJobDetail | MessageResponse> {
    const { data } = await api.post<UploadJobDetail | MessageResponse>(
      `/yt-channels/uploads/${id}/cancel`,
    );
    return data;
  },
};
