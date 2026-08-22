import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  differenceInDays,
} from "date-fns";

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return null;
  return differenceInDays(d, new Date());
}

export function formatDaysUntil(date: string | Date | null | undefined): string {
  const days = daysUntil(date);
  if (days === null) return "—";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

export function toInputDate(date: string | null | undefined): string {
  if (!date) return "";
  try {
    const d = parseISO(date);
    return isValid(d) ? format(d, "yyyy-MM-dd") : "";
  } catch {
    return "";
  }
}
