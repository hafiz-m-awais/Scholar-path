import Link from "next/link";

interface FollowUpSummaryProps {
  summary: { due: number; awaiting: number; replied: number };
}

export function FollowUpSummary({ summary }: FollowUpSummaryProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Follow-Up Summary</h2>
        <Link
          href="/supervisors"
          className="text-xs text-indigo-600 hover:underline"
        >
          View supervisors →
        </Link>
      </div>
      <div className="space-y-2">
        <Link
          href="/supervisors?follow_up=due"
          className="flex justify-between items-center py-1 rounded hover:bg-red-50 px-1 -mx-1 transition-colors group"
        >
          <span className="text-sm text-gray-600 group-hover:text-red-700">Due</span>
          <span className="text-sm font-semibold text-red-600">{summary.due}</span>
        </Link>
        <Link
          href="/supervisors?follow_up=awaiting"
          className="flex justify-between items-center py-1 rounded hover:bg-yellow-50 px-1 -mx-1 transition-colors group"
        >
          <span className="text-sm text-gray-600 group-hover:text-yellow-700">Awaiting Response</span>
          <span className="text-sm font-semibold text-yellow-600">{summary.awaiting}</span>
        </Link>
        <Link
          href="/supervisors?follow_up=replied"
          className="flex justify-between items-center py-1 rounded hover:bg-green-50 px-1 -mx-1 transition-colors group"
        >
          <span className="text-sm text-gray-600 group-hover:text-green-700">Replied</span>
          <span className="text-sm font-semibold text-green-600">{summary.replied}</span>
        </Link>
      </div>
    </div>
  );
}
