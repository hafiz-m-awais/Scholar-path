"use client";
import useSWR from "swr";

interface DashboardData {
  stats: Record<string, number>;
  upcoming_deadlines: {
    id: string;
    label: string;
    date: string;
    application: { id: string; university_name: string; program_name: string };
  }[];
  action_required: {
    type: string;
    title: string;
    application_name: string;
    application_id: string;
    due_date?: string;
  }[];
  follow_up_summary: {
    due: number;
    awaiting: number;
    replied: number;
  };
  missing_docs_count: number;
  recent_activity: {
    type: string;
    description: string;
    created_at: string;
  }[];
}

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    "dashboard",
    async () => {
      const res = await fetch("/api/v1/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = await res.json();
      return json.data as DashboardData;
    },
    { refreshInterval: 60_000 }
  );
  return { dashboard: data ?? null, isLoading, error, mutate };
}
