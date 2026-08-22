"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SentEmail } from "@/lib/types";

export function useEmails(applicationId?: string | null) {
  const key = ["emails", applicationId ?? "all"];
  const { data, error, isLoading, mutate } = useSWR(key, async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("sent_emails")
      .select("*")
      .order("sent_at", { ascending: false });
    if (applicationId) {
      query = query.eq("application_id", applicationId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as SentEmail[]) ?? [];
  });
  return { emails: data ?? [], isLoading, error, mutate };
}
