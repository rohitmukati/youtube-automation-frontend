import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { toApiError } from "@/lib/api/errors";
import { getValidAccessToken, notifySessionExpired, refreshAccessToken } from "@/lib/auth/session";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    retried?: boolean;
  }
}

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
  headers: env.skipNgrokWarning ? { "ngrok-skip-browser-warning": "true" } : {},
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.skipAuth) return config;
  try {
    const token = await getValidAccessToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
  } catch (error) {
    const apiError = toApiError(error);
    if (apiError.status === 401 || apiError.status === 403) notifySessionExpired();
    throw apiError;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const original = error.config;
      if (error.response?.status === 401 && original && !original.skipAuth && !original.retried) {
        original.retried = true;
        try {
          const token = await refreshAccessToken();
          original.headers.set("Authorization", `Bearer ${token}`);
          return await api.request(original);
        } catch (refreshError) {
          const apiError = toApiError(refreshError);
          if (apiError.status === 401 || apiError.status === 403) notifySessionExpired();
          throw apiError;
        }
      }
    }
    throw toApiError(error);
  },
);

export const publicApi = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
  headers: env.skipNgrokWarning ? { "ngrok-skip-browser-warning": "true" } : {},
});

publicApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    throw toApiError(error);
  },
);

export const bffApi = axios.create({ timeout: 30_000 });

bffApi.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    throw toApiError(error);
  },
);
