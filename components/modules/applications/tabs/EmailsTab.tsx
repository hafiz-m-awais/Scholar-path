"use client";
import { useEmails } from "@/hooks/useEmails";
import { useEmailCompose } from "@/hooks/useEmailCompose";
import { formatDateTime } from "@/lib/utils/dates";
import { Mail, Plus, Loader2 } from "lucide-react";

interface EmailsTabProps { applicationId: string; }

export function EmailsTab({ applicationId }: EmailsTabProps) {
  const { emails, isLoading } = useEmails(applicationId);
  const { openCompose } = useEmailCompose();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => openCompose({ application_id: applicationId })}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Compose Email
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : emails.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">No emails sent for this application</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {emails.map((email) => (
              <li key={email.id} className="px-4 py-3 flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{email.subject}</p>
                    <span className="text-xs text-gray-400 shrink-0">{formatDateTime(email.sent_at)}</span>
                  </div>
                  <p className="text-xs text-gray-500">To: {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email}</p>
                  {email.follow_up_date && !email.follow_up_done && (
                    <p className="text-xs text-orange-500 mt-0.5">Follow-up due: {email.follow_up_date}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
