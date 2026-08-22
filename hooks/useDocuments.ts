"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";

export function useDocuments(type?: string) {
  const key = ["documents", type ?? "all"];
  const { data, error, isLoading, mutate } = useSWR(key, async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (type) {
      query = query.eq("type", type);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as Document[]) ?? [];
  });
  return { documents: data ?? [], isLoading, error, mutate };
}
