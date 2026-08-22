"use client";
import { useSupervisors } from "@/hooks/useSupervisors";
import { ContactStatusBadge } from "@/components/shared/ContactStatusBadge";
import Link from "next/link";
import { Loader2, UserPlus, ExternalLink } from "lucide-react";

interface SupervisorsTabProps { applicationId: string; }

export function SupervisorsTab({ applicationId }: SupervisorsTabProps) {
  // In a full implementation this would filter by application_id via supervisor_applications
  // For now show all supervisors linked to this application
  const { supervisors, isLoading } = useSupervisors();

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Supervisors</h3>
        <Link
          href="/supervisors/new"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Supervisor
        </Link>
      </div>
      {supervisors.length === 0 ? (
        <p className="px-4 py-6 text-sm text-gray-400 text-center">No supervisors linked</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {supervisors.slice(0, 5).map((sup) => (
            <li key={sup.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{sup.name}</p>
                <p className="text-xs text-gray-500">{sup.department} · {sup.university_name}</p>
              </div>
              <ContactStatusBadge status={sup.contact_status} />
              <Link href={`/supervisors/${sup.id}`} className="p-1 rounded text-gray-400 hover:text-indigo-600">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
