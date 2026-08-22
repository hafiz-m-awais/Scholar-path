"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Deadline } from "@/lib/types";
import { addDays } from "date-fns";

export function useUpcomingDeadlines(days = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    ["upcoming-deadlines", days],
    async () => {
      const supabase = getSupabaseBrowserClient();
      const today = new Date().toISOString().split("T")[0];
      const future = addDays(new Date(), days).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("deadlines")
        .select("*, application:applications(university_name, program_name)")
        .gte("date", today)
        .lte("date", future)
        .order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    }
  );
  return { deadlines: (data as (Deadline & { application: { university_name: string; program_name: string } })[]) ?? [], isLoading, error, mutate };
}
