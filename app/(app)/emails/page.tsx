"use client";
import { useState } from "react";
import { useEmails } from "@/hooks/useEmails";
import { useEmailCompose } from "@/hooks/useEmailCompose";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ComposeModal } from "@/components/modules/emails/ComposeModal";
import { LogEmailModal } from "@/components/modules/emails/LogEmailModal";
import { EmailDetailModal } from "@/components/modules/emails/EmailDetailModal";
import type { SentEmail } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/dates";
import { Mail, Plus, Loader2, ArrowDownLeft, ArrowUpRight, Inbox, Eye, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EmailsPage() {
  const { emails, isLoading, mutate } = useEmails();
  const { composeOpen, composePrefill, openCompose, closeCompose } = useEmailCompose();
  const [logOpen, setLogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);

  return (
    <div>
      <PageHeader
        title="Emails"
        description="All sent and received emails"
        action={
          <div className="flex gap-2">
            <Link
              href="/emails/templates"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Templates
            </Link>
            <button
              onClick={() => setLogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Inbox className="w-4 h-4" />
              Log Email
            </button>
            <button
              onClick={() => openCompose()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Compose
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : emails.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-12 h-12" />}
          title="No emails yet"
          description="Compose an email to a supervisor, or log one you received."
          action={
            <button
              onClick={() => openCompose()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Compose Email
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-gray-50"
            >
              {email.direction === "received" ? (
                <ArrowDownLeft className="w-4 h-4 mt-0.5 text-green-600 shrink-0" />
              ) : (
                <ArrowUpRight className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Tracking badges */}
                    {email.status === "scheduled" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3" /> Scheduled
                      </span>
                    )}
                    {email.status === "failed" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                    {email.read_at && email.direction !== "received" && (
                      <span title={`Read ${new Date(email.read_at).toLocaleString()}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <Eye className="w-3 h-3" /> Read
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{formatDateTime(email.sent_at)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {email.direction === "received" ? "From" : "To"}:{" "}
                  {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email}
                </p>
                {email.body_text && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{email.body_text}</p>
                )}
                {email.follow_up_date && !email.follow_up_done && (
                  <p className="text-xs text-orange-500 mt-1">Follow-up due: {email.follow_up_date}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {composeOpen && (
        <ComposeModal
          prefill={composePrefill}
          onClose={closeCompose}
          onSent={() => {
            closeCompose();
            mutate();
          }}
        />
      )}

      {logOpen && (
        <LogEmailModal
          onClose={() => setLogOpen(false)}
          onLogged={() => {
            setLogOpen(false);
            mutate();
          }}
        />
      )}

      {selectedEmail && (
        <EmailDetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  );
}

