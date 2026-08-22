"use client";
import { useState } from "react";
import Link from "next/link";
import { useApplications } from "@/hooks/useApplications";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UrgencyBadge } from "@/components/shared/UrgencyBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils/dates";
import { GraduationCap, Plus, Search, Loader2 } from "lucide-react";
import type { ApplicationStatus, FundingType, Priority } from "@/lib/types";
import { calculateApplicationProgress } from "@/lib/utils/progress";
import { exportApplicationsToCSV } from "@/lib/utils/export";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "researching", "preparing", "submitted", "interview", "accepted", "rejected", "withdrawn"
];

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus[]>([]);
  const [fundingFilter, setFundingFilter] = useState<FundingType | "">("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");

  const { applications, isLoading } = useApplications({
    search: search || undefined,
    status: statusFilter.length ? statusFilter : undefined,
    funding_type: fundingFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const toggleStatus = (s: ApplicationStatus) => {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        description={`${applications.length} application${applications.length !== 1 ? "s" : ""}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportApplicationsToCSV(applications)}
              disabled={applications.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Export CSV
            </button>
            <Link
              href="/applications/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search university, program, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter.includes(s)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
            </button>
          ))}

          <select
            value={fundingFilter}
            onChange={(e) => setFundingFilter(e.target.value as FundingType | "")}
            className="px-3 py-1 rounded-full text-xs border border-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Funding</option>
            <option value="fully_funded">Fully Funded</option>
            <option value="partially_funded">Partially Funded</option>
            <option value="self_funded">Self Funded</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "")}
            className="px-3 py-1 rounded-full text-xs border border-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-12 h-12" />}
          title="No applications yet"
          description="Add your first PhD application to get started."
          action={
            <Link
              href="/applications/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {app.university_name}
                    </h3>
                    <StatusBadge status={app.status} />
                    {app.priority === "high" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {app.program_name}
                    {app.department ? ` · ${app.department}` : ""}
                    {app.country ? ` · ${app.country}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {app.degree_type}
                    {app.intake ? ` · ${app.intake}` : ""}
                    {app.funding_type !== "unknown"
                      ? ` · ${app.funding_type.replace("_", " ")}`
                      : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right space-y-1">
                  {app.application_deadline && (
                    <UrgencyBadge date={app.application_deadline} />
                  )}
                  <p className="text-xs text-gray-400">
                    {app.application_deadline
                      ? formatDate(app.application_deadline)
                      : "No deadline set"}
                  </p>
                  <div className="mt-2 w-24 ml-auto">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-gray-500">Progress</span>
                      <span className="text-[10px] font-medium text-gray-700">{calculateApplicationProgress(app)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all" 
                        style={{ width: `${calculateApplicationProgress(app)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
