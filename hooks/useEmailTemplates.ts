"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { EmailTemplate } from "@/lib/types";

export function useEmailTemplates() {
  const { data, error, isLoading, mutate } = useSWR("email-templates", async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as EmailTemplate[]) ?? [];
  });
  return { templates: data ?? [], isLoading, error, mutate };
}
