"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

export function useTasks(applicationId?: string | null) {
  const key = ["tasks", applicationId ?? "all"];
  const { data, error, isLoading, mutate } = useSWR(key, async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("tasks")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false });
    if (applicationId) {
      query = query.eq("application_id", applicationId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as Task[]) ?? [];
  });
  return { tasks: data ?? [], isLoading, error, mutate };
}
