"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Supervisor, SupervisorCommunication } from "@/lib/types";

export function useSupervisor(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ["supervisor", id] : null,
    async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("supervisors")
        .select("*, supervisor_applications(application_id, applications(university_name, program_name, status))")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Supervisor & { supervisor_applications: { application_id: string; applications: { university_name: string; program_name: string; status: string } }[] };
    }
  );

  const comms = useSWR(id ? ["supervisor-comms", id] : null, async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("supervisor_communications")
      .select("*")
      .eq("supervisor_id", id)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data as SupervisorCommunication[]) ?? [];
  });

  return {
    supervisor: data ?? null,
    communications: comms.data ?? [],
    isLoading,
    error,
    mutate,
    mutateCommunications: comms.mutate,
  };
}
