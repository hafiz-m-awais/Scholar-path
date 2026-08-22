"use client";
import type { SentEmail } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/dates";
import { ArrowDownLeft, ArrowUpRight, X } from "lucide-react";

interface EmailDetailModalProps {
  email: SentEmail;
  onClose: () => void;
}

export function EmailDetailModal({ email, onClose }: EmailDetailModalProps) {
  const isReceived = email.direction === "received";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            {isReceived ? (
              <ArrowDownLeft className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowUpRight className="w-4 h-4 text-indigo-600" />
            )}
            <h2 className="text-sm font-semibold text-gray-900">
              {isReceived ? "Received Email" : "Sent Email"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          <div>
            <p className="text-xs text-gray-400">{isReceived ? "From" : "To"}</p>
            <p className="text-sm text-gray-900">
              {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Subject</p>
            <p className="text-sm font-medium text-gray-900">{email.subject}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm text-gray-900">{formatDateTime(email.sent_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Message</p>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-md p-3 border border-gray-100">
              {email.body_text || <span className="text-gray-400">No content</span>}
            </div>
          </div>
          {email.follow_up_date && (
            <div>
              <p className="text-xs text-gray-400">Follow-up</p>
              <p className={`text-sm ${email.follow_up_done ? "text-gray-500" : "text-orange-600"}`}>
                {email.follow_up_date} {email.follow_up_done ? "(done)" : "(pending)"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
