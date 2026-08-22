"use client";
import type { SupervisorCommunication } from "@/lib/types";
import { formatDate } from "@/lib/utils/dates";
import { Mail, MessageSquare, Phone, Users, FileText, Reply } from "lucide-react";

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  email_sent: { icon: Mail, label: "Email Sent", color: "text-blue-500" },
  reply_received: { icon: Reply, label: "Reply Received", color: "text-green-500" },
  follow_up_sent: { icon: Mail, label: "Follow-up Sent", color: "text-yellow-500" },
  meeting: { icon: Users, label: "Meeting", color: "text-purple-500" },
  call: { icon: Phone, label: "Call", color: "text-orange-500" },
  note: { icon: FileText, label: "Note", color: "text-gray-500" },
};

interface CommunicationTimelineProps {
  communications: SupervisorCommunication[];
  supervisorId: string;
  onAdd: () => void;
}

export function CommunicationTimeline({ communications }: CommunicationTimelineProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <h3 className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">
        Communication History
      </h3>
      {communications.length === 0 ? (
        <p className="px-4 py-6 text-sm text-gray-400 text-center">No communication logged yet</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {communications.map((comm) => {
            const config = typeConfig[comm.type] ?? typeConfig.note;
            const Icon = config.icon;
            return (
              <li key={comm.id} className="px-4 py-3 flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-xs font-medium text-gray-700">{config.label}</span>
                    <span className="text-xs text-gray-400">{formatDate(comm.date)}</span>
                  </div>
                  {comm.subject && <p className="text-sm text-gray-900 mt-0.5">{comm.subject}</p>}
                  {comm.summary && <p className="text-sm text-gray-600 mt-0.5">{comm.summary}</p>}
                  {comm.follow_up_date && (
                    <p className="text-xs text-orange-500 mt-1">Follow-up: {formatDate(comm.follow_up_date)}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
