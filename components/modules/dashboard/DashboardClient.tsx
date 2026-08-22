"use client";
import { useDashboard } from "@/hooks/useDashboard";
import { StatsRow } from "./StatsRow";
import { UpcomingDeadlines } from "./UpcomingDeadlines";
import { ActionRequired } from "./ActionRequired";
import { FollowUpSummary } from "./FollowUpSummary";
import { MissingDocsSummary } from "./MissingDocsSummary";
import { RecentActivity } from "./RecentActivity";
import { Loader2 } from "lucide-react";

export function DashboardClient() {
  const { dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        Failed to load dashboard data. Please refresh the page.
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <StatsRow stats={dashboard.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDeadlines deadlines={dashboard.upcoming_deadlines} />
        <ActionRequired items={dashboard.action_required} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FollowUpSummary summary={dashboard.follow_up_summary} />
        <MissingDocsSummary count={dashboard.missing_docs_count} />
        <RecentActivity activities={dashboard.recent_activity} />
      </div>
    </div>
  );
}
