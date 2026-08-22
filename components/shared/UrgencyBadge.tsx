"use client";
import { cn } from "@/lib/utils/cn";
import { urgencyColors, urgencyDotColors, urgencyLevel } from "@/lib/utils/urgency";
import { formatDaysUntil } from "@/lib/utils/dates";

interface UrgencyBadgeProps {
  date: string | Date;
  className?: string;
}

export function UrgencyBadge({ date, className }: UrgencyBadgeProps) {
  const level = urgencyLevel(date);
  const colorClass = urgencyColors[level];
  const label = formatDaysUntil(date);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", urgencyDotColors[level])} />
      {label}
    </span>
  );
}
