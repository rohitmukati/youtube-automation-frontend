import axios from "axios";
import { ACCESS_TOKEN_SKEW_MS } from "@/config/constants";
import { toApiError } from "@/lib/api/errors";
import type { RefreshPayload, SessionPayload, User } from "@/types/api";

interface SessionState {
  accessToken: string | null;
  expiresAt: number;
  user: User | null;
}

let state: SessionState = { accessToken: null, expiresAt: 0, user: null };
let inflight: Promise<string> | null = null;
const expiredListeners = new Set<() => void>();

export function setSession({ user, accessToken, expiresIn }: SessionPayload) {
  state = { user, accessToken, expiresAt: Date.now() + expiresIn * 1000 };
}

export function setSessionUser(user: User) {
  state = { ...state, user };
}

export function getSessionUser(): User | null {
  return state.user;
}

export function hasAccessToken(): boolean {
  return Boolean(state.accessToken);
}

export function clearSession() {
  state = { accessToken: null, expiresAt: 0, user: null };
}

export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

export function notifySessionExpired() {
  clearSession();
  expiredListeners.forEach((listener) => listener());
}

async function requestRefresh(): Promise<string> {
  const { data } = await axios.post<RefreshPayload>("/api/auth/refresh", null, { timeout: 20_000 });
  state = {
    ...state,
    accessToken: data.accessToken,
    expiresAt: Date.now() + data.expiresIn * 1000,
  };
  return data.accessToken;
}

async function runRefresh(): Promise<string> {
  try {
    if (typeof navigator !== "undefined" && "locks" in navigator) {
      return await navigator.locks.request("session-refresh", requestRefresh);
    }
    return await requestRefresh();
  } catch (error) {
    throw toApiError(error);
  }
}

export function refreshAccessToken(): Promise<string> {
  if (!inflight) {
    inflight = runRefresh().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export async function getValidAccessToken(): Promise<string | null> {
  if (state.accessToken && state.expiresAt - Date.now() > ACCESS_TOKEN_SKEW_MS) {
    return state.accessToken;
  }
  return refreshAccessToken();
}
