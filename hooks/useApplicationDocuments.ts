"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ApplicationDocument } from "@/lib/types";

export function useApplicationDocuments(applicationId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    applicationId ? ["app-docs", applicationId] : null,
    async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("application_documents")
        .select("*, document:documents(*)")
        .eq("application_id", applicationId)
        .order("document_type", { ascending: true });
      if (error) throw error;
      return (data as ApplicationDocument[]) ?? [];
    }
  );
  return { appDocs: data ?? [], isLoading, error, mutate };
}
