"use client";
import useSWR from "swr";

export interface TimelineEvent {
  id: string;
  type: "task_created" | "task_completed" | "document_uploaded" | "communication";
  title: string;
  date: string;
}

export function useTimeline(applicationId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ["timeline", applicationId],
    async () => {
      const res = await fetch(`/api/v1/applications/${applicationId}/timeline`);
      if (!res.ok) throw new Error("Failed to load timeline");
      const json = await res.json();
      return json.data as TimelineEvent[];
    }
  );

  return { events: data ?? [], isLoading, error, mutate };
}
