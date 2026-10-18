import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toApiError, type ApiError } from "@/lib/api/errors";

type FieldMap<T extends FieldValues> = Partial<Record<string, Path<T>>>;

export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: FieldMap<T>,
): { handled: boolean; error: ApiError } {
  const apiError = toApiError(error);
  let handled = false;
  for (const issue of apiError.details) {
    const target = fieldMap[issue.field];
    if (target) {
      setError(target, { type: "server", message: issue.message });
      handled = true;
    }
  }
  return { handled, error: apiError };
}
