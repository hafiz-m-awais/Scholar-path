import { differenceInDays } from "date-fns";
import type { UrgencyLevel } from "@/lib/types";

export function urgencyLevel(date: Date | string): UrgencyLevel {
  const d = typeof date === "string" ? new Date(date) : date;
  const days = differenceInDays(d, new Date());
  if (days < 0) return "red"; // overdue
  if (days < 3) return "red"; // < 3 days
  if (days < 7) return "orange"; // 3–7 days
  if (days < 14) return "yellow"; // 7–14 days
  return "green"; // > 14 days
}

export const urgencyColors: Record<UrgencyLevel, string> = {
  red: "bg-red-100 text-red-700 border-red-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  green: "bg-green-100 text-green-700 border-green-200",
};

export const urgencyDotColors: Record<UrgencyLevel, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
};
