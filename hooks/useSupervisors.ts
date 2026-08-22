"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Supervisor } from "@/lib/types";

export function useSupervisors(search?: string) {
  const key = ["supervisors", search ?? ""];
  const { data, error, isLoading, mutate } = useSWR(key, async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("supervisors")
      .select("*")
      .order("name", { ascending: true });
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,university_name.ilike.%${search}%,department.ilike.%${search}%`
      );
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as Supervisor[]) ?? [];
  });
  return { supervisors: data ?? [], isLoading, error, mutate };
}
