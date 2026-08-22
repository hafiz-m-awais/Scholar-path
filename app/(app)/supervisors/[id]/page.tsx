"use client";
import { use } from "react";
import { useSupervisor } from "@/hooks/useSupervisor";
import { ContactStatusBadge } from "@/components/shared/ContactStatusBadge";
import { CommunicationTimeline } from "@/components/modules/supervisors/CommunicationTimeline";
import { QuickStatusActions } from "@/components/modules/supervisors/QuickStatusActions";
import Link from "next/link";
import { ArrowLeft, Edit, Mail, Globe, BookOpen, Loader2, ExternalLink } from "lucide-react";

export default function SupervisorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { supervisor, communications, isLoading, mutate, mutateCommunications } = useSupervisor(id);

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!supervisor) {
    return <p className="text-sm text-red-600">Supervisor not found.</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/supervisors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Supervisors
        </Link>
        <Link
          href={`/supervisors/${id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{supervisor.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {supervisor.department}
              {supervisor.department && supervisor.university_name ? " · " : ""}
              {supervisor.university_name}
            </p>
          </div>
          <ContactStatusBadge status={supervisor.contact_status} />
        </div>

        {supervisor.research_interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {supervisor.research_interests.map((ri, i) => (
              <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                {ri}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-4">
          {supervisor.email && (
            <a href={`mailto:${supervisor.email}`} className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
              <Mail className="w-3.5 h-3.5" />
              {supervisor.email}
            </a>
          )}
          {supervisor.website_url && (
            <a href={supervisor.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>
          )}
          {supervisor.google_scholar_url && (
            <a href={supervisor.google_scholar_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
              <BookOpen className="w-3.5 h-3.5" />
              Google Scholar
            </a>
          )}
          {supervisor.lab_url && (
            <a href={supervisor.lab_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" />
              Lab
            </a>
          )}
        </div>

        {supervisor.notes && (
          <p className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">{supervisor.notes}</p>
        )}
      </div>

      {/* Quick Actions */}
      <QuickStatusActions supervisorId={id} currentStatus={supervisor.contact_status} onUpdate={mutate} />

      {/* Communication Timeline */}
      <CommunicationTimeline
        communications={communications}
        supervisorId={id}
        onAdd={mutateCommunications}
      />
    </div>
  );
}
