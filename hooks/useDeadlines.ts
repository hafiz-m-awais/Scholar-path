"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Deadline } from "@/lib/types";

export function useDeadlines(applicationId?: string | null) {
  const key = ["deadlines", applicationId ?? "all"];
  const { data, error, isLoading, mutate } = useSWR(key, async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("deadlines")
      .select("*")
      .order("date", { ascending: true });
    if (applicationId) {
      query = query.eq("application_id", applicationId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as Deadline[]) ?? [];
  });
  return { deadlines: data ?? [], isLoading, error, mutate };
}
