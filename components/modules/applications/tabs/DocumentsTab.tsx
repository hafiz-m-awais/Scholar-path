"use client";
import { useApplicationDocuments } from "@/hooks/useApplicationDocuments";
import { DOCUMENT_TYPE_LABELS } from "@/lib/types";
import { CheckCircle2, Paperclip, XCircle, AlertTriangle, Loader2, UploadCloud } from "lucide-react";
import { formatDate } from "@/lib/utils/dates";
import Link from "next/link";

interface DocumentsTabProps {
  applicationId: string;
}

const statusIcons = {
  missing: <XCircle className="w-4 h-4 text-red-500" />,
  attached: <Paperclip className="w-4 h-4 text-blue-500" />,
  submitted: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  not_needed: <AlertTriangle className="w-4 h-4 text-gray-400" />,
};

export function DocumentsTab({ applicationId }: DocumentsTabProps) {
  const { appDocs, isLoading, mutate } = useApplicationDocuments(applicationId);

  const counts = {
    missing: appDocs.filter((d) => d.status === "missing" && !d.is_not_needed).length,
    attached: appDocs.filter((d) => d.status === "attached").length,
    submitted: appDocs.filter((d) => d.status === "submitted").length,
    not_needed: appDocs.filter((d) => d.is_not_needed).length,
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex gap-4">
          <span className="text-sm text-red-600 font-medium">❌ {counts.missing} Missing</span>
          <span className="text-sm text-blue-600 font-medium">📎 {counts.attached} Attached</span>
          <span className="text-sm text-green-600 font-medium">✅ {counts.submitted} Submitted</span>
          <span className="text-sm text-gray-400 font-medium">⚠️ {counts.not_needed} Not Needed</span>
        </div>
        <Link
          href={`/documents/upload?applicationId=${applicationId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md hover:bg-indigo-100"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload Document
        </Link>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-50">
        {appDocs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">
            No document checklist set up yet.
          </p>
        ) : (
          appDocs.map((doc) => (
            <div key={doc.id} className="px-4 py-3 flex items-center gap-3">
              {statusIcons[doc.is_not_needed ? "not_needed" : doc.status]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                </p>
                {doc.document && (
                  <p className="text-xs text-gray-500">
                    {doc.document.name} ({doc.document.version_label})
                  </p>
                )}
              </div>
              {doc.submitted_at && (
                <span className="text-xs text-gray-400">{formatDate(doc.submitted_at)}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
