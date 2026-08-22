"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserSettings } from "@/lib/types";

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR("settings", async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return (data as UserSettings) ?? null;
  });
  return { settings: data ?? null, isLoading, error, mutate };
}
