"use client";
import Link from "next/link";
import type { ApplicationStatus } from "@/lib/types";
import { statusConfig } from "@/components/shared/StatusBadge";

interface StatsRowProps {
  stats: Record<string, number>;
}

const statStatuses: ApplicationStatus[] = [
  "researching",
  "preparing",
  "submitted",
  "interview",
  "accepted",
  "rejected",
];

// Map status → query param for filtering /applications page
const statusFilterMap: Record<ApplicationStatus, string> = {
  researching: "researching",
  preparing: "preparing",
  submitted: "submitted",
  interview: "interview",
  accepted: "accepted",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

export function StatsRow({ stats }: StatsRowProps) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* Total — links to all applications */}
      <Link
        href="/applications"
        className="bg-white rounded-lg border border-gray-200 p-4 col-span-1 hover:border-indigo-300 hover:shadow-sm transition-all group cursor-pointer"
      >
        <div className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {total}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">Total</div>
      </Link>

      {/* Per-status cards — link to filtered applications */}
      {statStatuses.map((s) => {
        const config = statusConfig[s];
        return (
          <Link
            key={s}
            href={`/applications?status=${statusFilterMap[s]}`}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {stats[s] ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{config.label}</div>
          </Link>
        );
      })}
    </div>
  );
}
