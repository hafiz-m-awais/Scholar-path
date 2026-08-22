"use client";
import { useSubmissions } from "@/hooks/useSubmissions";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils/dates";
import { Globe, Mail, CheckCircle2, Circle, Loader2, SendHorizontal } from "lucide-react";

const methodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  portal: Globe,
  email: Mail,
};

export default function SubmissionsPage() {
  const { submissions, isLoading } = useSubmissions();

  return (
    <div>
      <PageHeader title="Submissions" description="All submission records" />

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={<SendHorizontal className="w-12 h-12" />}
          title="No submissions logged yet"
          description="Log submissions from inside each application's Submissions tab."
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {submissions.map((sub) => {
            const Icon = methodIcons[sub.method] ?? Mail;
            return (
              <div key={sub.id} className="px-4 py-4 flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
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
                  <p className="text-xs text-gray-500 capitalize">{sub.method.replace("_", " ")}</p>
                  {sub.documents && sub.documents.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {sub.documents.map((d) => (
                        <span key={d.id} className="px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">
                          {d.document_name_snapshot}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
