import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { ApiError, toApiError } from "@/lib/api/errors";

function axiosError(status: number | null, data?: unknown) {
  const config = { headers: new AxiosHeaders() };
  const response =
    status === null ? undefined : { status, data, statusText: "", headers: {}, config };
  return new AxiosError("failed", undefined, config, undefined, response);
}

describe("toApiError", () => {
  it("reads the backend error envelope", () => {
    const error = toApiError(
      axiosError(422, {
        success: false,
        error: {
          code: "validation_error",
          message: "Invalid email",
          details: [{ field: "email", message: "Invalid email" }],
        },
      }),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(422);
    expect(error.code).toBe("validation_error");
    expect(error.details[0]?.field).toBe("email");
  });

  it("explains network failures", () => {
    const error = toApiError(axiosError(null));
    expect(error.code).toBe("network_error");
    expect(error.message).toMatch(/reach the server/i);
  });

  it("returns existing ApiError instances untouched", () => {
    const original = new ApiError(401, "unauthorized", "Nope");
    expect(toApiError(original)).toBe(original);
  });
});
