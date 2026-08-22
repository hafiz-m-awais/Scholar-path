"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ApplicationLink, PortalCredential } from "@/lib/types";

export function usePortal(applicationId: string | null) {
  const links = useSWR(
    applicationId ? ["portal-links", applicationId] : null,
    async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("application_links")
        .select("*")
        .eq("application_id", applicationId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as ApplicationLink[]) ?? [];
    }
  );

  const credentials = useSWR(
    applicationId ? ["portal-creds", applicationId] : null,
    async () => {
      // Credentials are fetched via API route (server decrypts)
      const res = await fetch(
        `/api/v1/applications/${applicationId}/credentials`
      );
      if (!res.ok) throw new Error("Failed to fetch credentials");
      const json = await res.json();
      return (json.data as PortalCredential[]) ?? [];
    }
  );

  return {
    links: links.data ?? [],
    credentials: credentials.data ?? [],
    isLoading: links.isLoading || credentials.isLoading,
    mutateLinks: links.mutate,
    mutateCredentials: credentials.mutate,
  };
}
