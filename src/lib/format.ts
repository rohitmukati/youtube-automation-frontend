import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy, h:mm a") : "—";
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy") : "—";
}

export function formatRelative(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  if (Math.abs(diff) < 45_000) return "just now";
  const distance = formatDistanceToNowStrict(date);
  return diff >= 0 ? `${distance} ago` : `in ${distance}`;
}
