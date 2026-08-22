"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Application } from "@/lib/types";

export function useApplication(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["application", id] : null,
    async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Application;
    }
  );
  return { application: data ?? null, isLoading, error, mutate };
}
