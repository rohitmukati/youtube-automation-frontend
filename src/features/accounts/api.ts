import { toCredentialsStatus } from "@/features/accounts/credentials";
import { api } from "@/lib/api/client";
import type {
  AccountListResponse,
  ConnectInitiateResponse,
  MessageResponse,
  YouTubeAccount,
  YouTubeCredentialsPayload,
  YouTubeCredentialsResponse,
  YouTubeCredentialsStatus,
} from "@/types/api";

export const accountsApi = {
  async list(): Promise<AccountListResponse> {
    const { data } = await api.get<AccountListResponse>("/youtube/accounts");
    return data;
  },

  async connect(nickname: string): Promise<ConnectInitiateResponse> {
    const { data } = await api.post<ConnectInitiateResponse>("/youtube/connect", { nickname });
    return data;
  },

  async update(
    id: string,
    payload: { nickname?: string; notes?: string | null },
  ): Promise<YouTubeAccount> {
    const { data } = await api.patch<YouTubeAccount>(`/youtube/accounts/${id}`, payload);
    return data;
  },

  async disconnect(id: string): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`/youtube/accounts/${id}`);
    return data;
  },

  async refreshAll(): Promise<void> {
    await api.post("/youtube/accounts/refresh");
  },

  async refreshOne(id: string): Promise<void> {
    await api.post(`/youtube/accounts/${id}/refresh`);
  },
};

export const credentialsApi = {
  async get(): Promise<YouTubeCredentialsStatus> {
    const { data } = await api.get<YouTubeCredentialsResponse>("/youtube/credentials");
    return toCredentialsStatus(data);
  },

  async save(payload: YouTubeCredentialsPayload): Promise<YouTubeCredentialsStatus> {
    const { data } = await api.put<YouTubeCredentialsResponse>("/youtube/credentials", payload);
    return toCredentialsStatus(data);
  },

  async remove(): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>("/youtube/credentials");
    return data;
  },
};