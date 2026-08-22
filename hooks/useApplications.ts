"use client";
import useSWR from "swr";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Application } from "@/lib/types";

export interface ApplicationFilters {
  status?: string[];
  country?: string;
  funding_type?: string;
  priority?: string;
  search?: string;
}

async function fetchApplications(filters: ApplicationFilters = {}): Promise<Application[]> {
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters.country) {
    query = query.eq("country", filters.country);
  }
  if (filters.funding_type) {
    query = query.eq("funding_type", filters.funding_type);
  }
  if (filters.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters.search) {
    query = query.or(
      `university_name.ilike.%${filters.search}%,program_name.ilike.%${filters.search}%,department.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Application[]) ?? [];
}

export function useApplications(filters: ApplicationFilters = {}) {
  const key = ["applications", JSON.stringify(filters)];
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    fetchApplications(filters)
  );
  return { applications: data ?? [], isLoading, error, mutate };
}
