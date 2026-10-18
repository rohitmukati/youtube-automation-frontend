import axios from "axios";
import type { FieldIssue } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldIssue[];

  constructor(status: number, code: string, message: string, details: FieldIssue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const NETWORK_MESSAGE = "We could not reach the server. Check your connection and try again.";
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

interface LooseErrorBody {
  error?: { code?: string; message?: string; details?: FieldIssue[] };
  detail?: unknown;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(
        0,
        error.code === "ECONNABORTED" ? "timeout" : "network_error",
        NETWORK_MESSAGE,
      );
    }
    const body = error.response.data as LooseErrorBody | undefined;
    const status = error.response.status;
    if (body?.error?.message) {
      return new ApiError(
        status,
        body.error.code ?? "error",
        body.error.message,
        Array.isArray(body.error.details) ? body.error.details : [],
      );
    }
    if (typeof body?.detail === "string") return new ApiError(status, "error", body.detail);
    return new ApiError(
      status,
      "error",
      status >= 500 ? "The server ran into a problem. Please try again shortly." : GENERIC_MESSAGE,
    );
  }

  if (error instanceof Error)
    return new ApiError(0, "client_error", error.message || GENERIC_MESSAGE);
  return new ApiError(0, "unknown", GENERIC_MESSAGE);
}

export function getErrorMessage(error: unknown, fallback = GENERIC_MESSAGE): string {
  const message = toApiError(error).message;
  return message || fallback;
}
