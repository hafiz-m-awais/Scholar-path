"use client";
import { useSubmissions } from "@/hooks/useSubmissions";
import { formatDate } from "@/lib/utils/dates";
import { Globe, Mail, CheckCircle2, Circle, Loader2 } from "lucide-react";

interface SubmissionsTabProps { applicationId: string; }

const methodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  portal: Globe,
  email: Mail,
};

export function SubmissionsTab({ applicationId }: SubmissionsTabProps) {
  const { submissions, isLoading } = useSubmissions(applicationId);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : submissions.length === 0 ? (
        <p className="px-4 py-6 text-sm text-gray-400 text-center">No submissions logged yet</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {submissions.map((sub) => {
            const Icon = methodIcons[sub.method] ?? Mail;
            return (
              <li key={sub.id} className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{sub.sent_to_label}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {sub.confirmed ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Circle className="w-3.5 h-3.5" /> Unconfirmed
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(sub.sent_at)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{sub.method.replace("_", " ")}</p>
                    {sub.documents && sub.documents.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {sub.documents.map((d) => (
                          <span key={d.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            {d.document_name_snapshot}
                            {d.document_version_label ? ` (${d.document_version_label})` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    {sub.notes && <p className="text-xs text-gray-400 mt-1">{sub.notes}</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
