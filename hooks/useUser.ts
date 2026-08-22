"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR("user", async () => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  });

  return {
    user: data ?? null,
    isLoading,
    error,
    mutate,
  };
}
