"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SubmissionLog } from "@/lib/types";

export function useSubmissions(applicationId?: string | null) {
  const key = ["submissions", applicationId ?? "all"];
  const { data, error, isLoading, mutate } = useSWR(key, async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("submission_logs")
      .select("*, documents:submission_documents(*)")
      .order("sent_at", { ascending: false });
    if (applicationId) {
      query = query.eq("application_id", applicationId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as SubmissionLog[]) ?? [];
  });
  return { submissions: data ?? [], isLoading, error, mutate };
}
