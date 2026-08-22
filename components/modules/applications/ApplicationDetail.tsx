"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Application } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils/dates";
import { useUIStore } from "@/store/uiStore";
import { OverviewTab } from "./tabs/OverviewTab";
import { SupervisorsTab } from "./tabs/SupervisorsTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { TasksTab } from "./tabs/TasksTab";
import { EmailsTab } from "./tabs/EmailsTab";
import { SubmissionsTab } from "./tabs/SubmissionsTab";
import { PortalTab } from "./tabs/PortalTab";
import { NotesTab } from "./tabs/NotesTab";
import { TimelineTab } from "./tabs/TimelineTab";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TABS = [
  "Overview", "Supervisors", "Documents", "Tasks",
  "Emails", "Submissions", "Portal", "Timeline", "Notes",
] as const;

type Tab = typeof TABS[number];

interface ApplicationDetailProps {
  application: Application;
  mutate: () => void;
}

import { calculateApplicationProgress } from "@/lib/utils/progress";

export function ApplicationDetail({ application, mutate }: ApplicationDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const router = useRouter();
  const { openConfirmDialog } = useUIStore();

  const handleDelete = () => {
    openConfirmDialog({
      title: "Delete Application",
      description: `Are you sure you want to delete the application for ${application.university_name}? This cannot be undone.`,
      onConfirm: async () => {
        await fetch(`/api/v1/applications/${application.id}`, { method: "DELETE" });
        router.push("/applications");
      },
    });
  };

  const progress = calculateApplicationProgress(application);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Applications
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{application.university_name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-sm text-gray-500">{application.program_name}</p>
            <StatusBadge status={application.status} />
            {application.application_deadline && (
              <span className="text-xs text-gray-400">
                Due {formatDate(application.application_deadline)}
              </span>
            )}
          </div>
          
          <div className="mt-4 max-w-md flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-xs font-medium text-gray-500">{progress}% Complete</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/applications/${application.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex -mb-px gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "Overview" && <OverviewTab application={application} onStatusChange={mutate} />}
        {activeTab === "Supervisors" && <SupervisorsTab applicationId={application.id} />}
        {activeTab === "Documents" && <DocumentsTab applicationId={application.id} />}
        {activeTab === "Tasks" && <TasksTab applicationId={application.id} />}
        {activeTab === "Emails" && <EmailsTab applicationId={application.id} />}
        {activeTab === "Submissions" && <SubmissionsTab applicationId={application.id} />}
        {activeTab === "Portal" && <PortalTab applicationId={application.id} />}
        {activeTab === "Timeline" && <TimelineTab applicationId={application.id} />}
        {activeTab === "Notes" && <NotesTab application={application} onSave={mutate} />}
      </div>
    </div>
  );
}
