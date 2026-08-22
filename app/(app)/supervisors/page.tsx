"use client";
import { useState } from "react";
import Link from "next/link";
import { useSupervisors } from "@/hooks/useSupervisors";
import { ContactStatusBadge } from "@/components/shared/ContactStatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users, Plus, Search, Loader2, Mail, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";

export default function SupervisorsPage() {
  const [search, setSearch] = useState("");
  const { supervisors, isLoading } = useSupervisors(search || undefined);

  return (
    <div>
      <PageHeader
        title="Supervisors"
        description={`${supervisors.length} supervisor${supervisors.length !== 1 ? "s" : ""}`}
        action={
          <Link
            href="/supervisors/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Supervisor
          </Link>
        }
      />

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, university, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : supervisors.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="No supervisors yet"
          description="Add professors and researchers you are contacting."
          action={
            <Link
              href="/supervisors/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Supervisor
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {supervisors.map((sup) => (
            <Link
              key={sup.id}
              href={`/supervisors/${sup.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{sup.name}</h3>
                <ContactStatusBadge status={sup.contact_status} />
              </div>
              <p className="text-xs text-gray-500 mb-1">
                {sup.department}
                {sup.department && sup.university_name ? " · " : ""}
                {sup.university_name}
              </p>
              {sup.research_interests?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {sup.research_interests.slice(0, 3).map((ri, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                      {ri}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-3 text-gray-400">
                {sup.email && <Mail className="w-3.5 h-3.5" />}
                {sup.website_url && <Globe className="w-3.5 h-3.5" />}
                {sup.last_contacted_at && (
                  <span className="text-xs ml-auto">Last: {formatDate(sup.last_contacted_at)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
