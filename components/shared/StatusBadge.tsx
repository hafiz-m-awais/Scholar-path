"use client";
import { cn } from "@/lib/utils/cn";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  researching: {
    label: "Researching",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  preparing: {
    label: "Preparing",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  submitted: {
    label: "Submitted",
    className: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  interview: {
    label: "Interview",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

export const statusConfig = STATUS_CONFIG;

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
